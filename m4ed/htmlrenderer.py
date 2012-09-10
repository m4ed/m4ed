from misaka import (
    Markdown,
    HtmlRenderer
    )

from matplotlib.mathtext import ParseFatalException

# We need this to acquire a lock to prevent multi threaded apps
# messing everything up
from matplotlib.backends.backend_agg import RendererAgg

import hashlib
# Python 3.0 stuff, equivalent to cStringIO in 2.7
from io import BytesIO
from HTMLParser import HTMLParser
from xml.sax.saxutils import quoteattr

from redis.exceptions import ConnectionError

import time
import json

from m4ed.util import filters

from string import Template

DEBUG = False

MULTI_CHOICE_TEMPLATE = Template((
    '${html_tag}'
    '<script>'
    'require(["config"],'
    'function(){'
        'require(["models/multi", "views/student/multi"],'
        # MC = MultipleChoice
        # MCV = MultipleChoiceView
        # Using abbreviated terms since minifying is fun
        'function(MC,MCV){'
            'new MCV({'
                'model:new MC(${args}),'
                'custom:{'
                  'block_id:"#m4ed-${block_id}"'
                '}'
            '});'
        '});'
    '});'
    '</script>'
    ))


class CustomHtmlRenderer(HtmlRenderer):
    def __new__(cls, flags=0, **kwargs):
        return HtmlRenderer.__new__(cls, flags)

    def __init__(self, math_text_parser, settings, mongo_db=None, redis_db=None, *args, **kwargs):
        #settings = kwargs.pop('settings')
        #print settings
        self.cloud = kwargs.pop('cloud', False)
        if self.cloud:
            self.work_queue = kwargs.pop('work_queue', None)
            if not self.work_queue:
                raise ValueError(('Supplying the cloud argument'
                    'requires you to also supply the cloud upload queue object'))

        if not mongo_db:
            self.mongo_db = settings['db.mongo.conn'][settings['db.mongo.collection_name']]
        else:
            self.mongo_db = mongo_db
        if not redis_db:
            self.redis_db = settings['db.redis.conn']
        else:
            self.redis_db = redis_db
        self.cache_route = settings['preview.img_cache_route']
        self.cache_time = int(settings['preview.img_cache_time'])

        self.math_text_parser = math_text_parser

        self.htmlparser = HTMLParser()

        self.funcs = {
            'img': self.handle_image_macro,
            'image': self.handle_image_macro,
            'math': self.handle_math_macro,
            'multi': self.handle_multiple_choice_macro,
            'multi-choice': self.handle_multiple_choice_macro,
            'multiple-choice': self.handle_multiple_choice_macro,
        }

        self.entities = {
            ' ': '&#32;',  # space
            '"': '&#34;',  # quote
            "'": '&#39;',  # apostrophe
            ',': '&#44;',  # comma
            '=': '&#61;',  # equals
            '\\': '&#92;'  # backslash
        }

        # Secondary renderer for snippet rendering
        self.snippet_renderer = Markdown(renderer=HtmlRenderer())

        self.post_process_blocks = list()
        self.answers = dict()

    @property
    def _404_img(self):
        return (
            'https://a9e01ec7324d40fdae33-8c4723fa6cef88b6ec249366d018b063'
            '.ssl.cf1.rackcdn.com/notfound.png'
        )

    def _normalize(self, text):
        return filters.force_utf8(' '.join(text.strip(' \t').split()))

    def get_answers(self):
        return self.answers

    def handle_image_macro(self, kwargs):
        # If there was anything passed with keyword 'data' render it
        # using sundown
        default = kwargs.pop('default', None)
        if default:
            imgid = default
            data = ''
        else:
            data = kwargs.pop('data', None)
            if data:
                data = self.snippet_renderer.render(data)
            imgid = kwargs.pop('id', None)
        return '<img alt="{alt}" src="{src}" />{data}'.format(
            alt=kwargs.pop('alt', ''),
            src=self.imgid_to_imgurl(imgid) if imgid else self._404_img,
            data=data
            )

    def handle_math_macro(self, kwargs):
        if DEBUG:
            print "kwargs: ", kwargs
        try:
            data = kwargs.pop('data', None)
            if not data:
                data = kwargs.pop('default', '')
        except AttributeError:
            return ''
        if DEBUG:
            print "data: ", data
        res = []
        lines = self.htmlparser.unescape(data).split('\n')
        if DEBUG:
            print lines
        num_lines = len(lines)
        for i, line in enumerate(lines):
            line = self._normalize(line)
            if line == '' and i != num_lines:
                res.append('<br />')
            else:
                res.append(self.math_to_img(line))

        return ''.join(res)

    def handle_multiple_choice_macro(self, kwargs):
        block_id = kwargs.pop('block_id', None)
        if not block_id:
            raise ValueError('block_id was undefined')
        html_tag = '<span id="m4ed-{block_id}"></span>'.format(block_id=block_id)
        data = kwargs.pop('data', '')
        multi_choice_args = []
        temp_args = []
        # Init the answer list
        self.answers[str(block_id)] = list()
        next_answer_id = 0
        for line in data.split('\n'):
            is_hint = False
            is_correct = False
            is_multi_line = False
            line = line.lstrip()  # self._normalize(line)
            line = line.split(' ', 1)
            try:
                #print repr(line[1])
                line_starter = line[0]
                line_data = line[1].lstrip()
                # Correct answers end to an exclamation mark
                if line_starter.endswith('!'):
                    line_starter = line_starter[:-1] + '.'
                    is_correct = True
                elif line_starter.endswith(':') and next_answer_id != 0:
                    is_hint = True

                if next_answer_id != 0:
                    previous_prefix = multi_choice_args[next_answer_id - 1]['prefix']
                    if line_starter == previous_prefix:
                        is_multi_line = True

            except IndexError:  # When we fail to split the line
                continue

            # If it's a hint or similar, add it to args of the previous multiple choice
            prev_id = next_answer_id - 1
            #temp_args.append({})
            if is_hint and prev_id >= 0:
                try:
                    temp_args[prev_id]['hint_text'] += '\n' + line_data
                except KeyError:
                    temp_args[prev_id]['hint_text'] = line_data
                continue
            elif is_multi_line and prev_id >= 0:
                try:
                    temp_args[prev_id]['question_text'] += '\n' + line_data
                except KeyError:
                    temp_args[prev_id]['question_text'] = line_data
                continue
            else:
                try:
                    prev = multi_choice_args[prev_id]
                    temp = temp_args[prev_id]
                    prev['html'] = self.snippet_renderer.render(temp['question_text'])
                    prev['hint'] = self.snippet_renderer.render(temp['hint_text'])
                except (IndexError, KeyError):
                    # In case we get here it means this is the first line
                    # just pass and generate the next answer
                    pass
            next_answer_id += 1
            if is_correct:
                # If the answer parsed is marked as being correct, add it to
                # our correct answer collection
                self.answers[str(block_id)].append(str(next_answer_id))
            # Add the question text to temporary list
            temp_args.append({'question_text': line_data, 'hint_text': ''})
            multi_choice_args.append({
                'id': next_answer_id,
                'prefix': line_starter,
                'hint_class': 'green' if is_correct else 'red'
            })

        # Special case for the last item in list
        prev_id = next_answer_id - 1
        try:
            prev = multi_choice_args[prev_id]
            temp = temp_args[prev_id]
        except IndexError:
            return ''
        #print repr(temp['question_text'])
        prev['html'] = self.snippet_renderer.render(temp['question_text'])
        prev['hint'] = self.snippet_renderer.render(temp['hint_text'])

        self.post_process_blocks.append((
            html_tag,
            MULTI_CHOICE_TEMPLATE.substitute(
                html_tag=html_tag,
                block_id=block_id,
                args=json.dumps({'choices': multi_choice_args})
                )
            ))
        return html_tag

    def _find_tag(self, text, tag, index):
        while (True):
            index = text.find(tag, index)
            if index < 0:
                break
            # Check that the start tag was not escaped
            elif text[index - 1] == '\\':
                # Slice the backslash from the text
                text = text[:index - 1] + text[index:]
                # Try to find the next start index
                index += len(tag)  # block_start_tag_len
                continue
            else:
                break
        return (text, index)

    def preprocess(self, text, debug=True):
        if debug:
            print '------------------------- preprocessing -------------------------'
            start = time.time()
        #result = self.math_regex.sub(self.math_to_img, text)

        block_id = 0
        block_start_index = 0
        block_start_tag = '[['
        block_start_tag_len = len(block_start_tag)
        block_end_tag = ']]'
        block_end_tag_len = len(block_end_tag)
        while (True):
            text, block_start_index = self._find_tag(text, block_start_tag, block_start_index)

            if block_start_index < 0:
                break

            # Offset the start index by the length of start tag
            block_start_index += block_start_tag_len

            text, block_end_index = self._find_tag(text, block_end_tag, block_start_index)
            if block_end_index < 0:
                break

            block_id += 1

            block = text[block_start_index:block_end_index]
            firstline = block.find("\n")
            if firstline < 0:
                firstline = len(block)

            func_line = block[:firstline]
            data = block[firstline + 1:block_end_index]

            func_end = func_line.find(":")
            if func_end < 0:
                func_end = len(func_line)
            func_name = func_line[:func_end].lower()
            if func_name not in self.funcs:
                block_start_index = block_end_index + block_end_tag_len  # after "]]"
                continue
            func_args = func_line[func_end + 1:].strip()
            # make keyword args:
            # args are separated with ","
            # each valid arg has arg=value
            # print 'MY ARGUMENST WERE', func_args
            kwargs = dict(data=data, block_id=block_id)

            func_args = self.parse_quotes(func_args)

            func_args = func_args.strip().split(",")
            for arg in func_args:
                arg = arg.strip().split("=")
                if len(arg) == 2:
                    # valid key-val pair
                    kwargs[arg[0].strip().lower()] = arg[1].strip()
                else:
                    # all is single arg
                    if not kwargs.get('default'):
                        # If there already is a default arg ignore the rest
                        kwargs['default'] = arg[0].strip()
            # if func_name not in self.funcs:
            #     block_start_index = block_end_index + block_end_tag_len  # after "]]"
            #     continue
            retval = self.funcs[func_name](kwargs)

            text = (
                text[:block_start_index - block_start_tag_len] +
                retval +
                text[block_end_index + block_end_tag_len:]
                )
            block_start_index += len(retval) - block_end_tag_len
        if debug:
            print 'It took', (time.time() - start) * 1000, 'milliseconds to preprocess the preview'
        #return result
        return text

    def parse_quotes(self, text):
        # Try to determine if the text is quoted
        first_quote = 0
        while True:
            quot = text.find('"', first_quote)
            apos = text.find("'", first_quote)
            if quot == apos:  # Neither one was found
                break
            elif quot == -1:  # Quote not found
                q = "'"
            elif apos == -1:  # Apostrophe not found
                q = '"'
            else:  # Both found, see which one was first
                q = '"' if quot < apos else "'"

            # Probably always 1 but you never know...
            quote_offset = len(q)
            first_quote = text.find(q, first_quote)
            if first_quote < 0:
                break
            # Move the first_quote starting pos so we don't unnecessarily
            # start find() from the same position
            first_quote += quote_offset
            second_quote = text.find(q, first_quote)
            if second_quote < 0:
                break

            # Escape the quoted text so it doesn't mess up our parser later on.
            # The 'entities' dictionary defines what characters we want to escape.
            # Example: "\alpha = \beta, 23" =>
            # &#92;alpha&#32;&#61;&#32;&#92;beta&#44;&#32;23
            escaped_text = quoteattr(
                    text[first_quote:second_quote],
                    entities=self.entities
                )[quote_offset:-quote_offset]

            # Combine the quoted text back together after escaping it
            text = (
                text[:first_quote - quote_offset] +
                escaped_text +
                text[second_quote + quote_offset:]
                )

        return text

    def postprocess(self, text, debug=True):
        if debug:
            print '------------------------- postprocessing -------------------------'
            start = time.time()

        for tag, block in self.post_process_blocks:
            #print tag, block
            text = text.replace(tag, block)
        #self.post_process_blocks = list()

        if debug:
            print 'It took', (time.time() - start) * 1000, 'milliseconds to postprocess the preview'

        return text

    def imgid_to_imgurl(self, imgid):
        a = self.mongo_db.assets.find_one({'id': imgid})
        if not a or not a.get('url'):
            return self._404_img
        return a['url']

    def math_to_img(self, math, debug=False):
        redis_db = self.redis_db
        if debug:
            print math

        m = hashlib.md5()
        m.update(math)

        db_key = 'img:png:' + str(m.hexdigest())
        html = '<img alt="math" src="{}" />'.format(self.cache_route + db_key)
        if self.cloud:
            print 'We should now save to cloud'
        else:
            try:
                if redis_db.exists(db_key):
                    ttl = redis_db.ttl(db_key)
                    if debug:
                        print 'Cache hit! Serving the cached img and refreshing cache!'
                        print 'The TTL remaining was', ttl, 'seconds'
                        print ' => TTL now ', self.cache_time, 'seconds'
                    # Refresh the cache expire timer
                    redis_db.expire(db_key, self.cache_time)
                    return html
                if debug:
                    print 'Cache miss! Generating a new img!'
            except ConnectionError:
                return ''

        _input = BytesIO(str('${0}$'.format(math)))
        output = BytesIO()
        self.math_to_image(_input.getvalue(), output,
            color='black', dpi=120, fontsize=10)
        if self.cloud:
            #self.work_queue.send('save:')
            print 'We should now save to cloud'
        else:
            redis_db.set(db_key, output.getvalue())
            # Cache images for 1 minute(s)
            redis_db.expire(db_key, self.cache_time)
        return html

    def math_to_image(self, s, filename_or_obj, color='black', dpi=None, fontsize=10):
        """
        This function is a thread safe modification of matplotlib's
        mathtext:math_to_image. The MathTextParser render's font caching
        mechanism makes it impossible to use with multiple threads.
        Thus we first have to acquire a lock from matplotlib RendererAgg and
        block other threads from entering render while it's in process.

        Given a math expression, renders it in a closely-clipped bounding
        box to an image file.

        *s*
           A math expression.  The math portion should be enclosed in
           dollar signs.

        *filename_or_obj*
           A filepath or writable file-like object to write the image data
           to.

        *color*
           Text color

        *dpi*
           Override the output dpi, otherwise use the default associated
           with the output format.

        *fontsize*
           The font size, defaults to 10.
        """
        try:
            s = unicode(s)
        except UnicodeDecodeError:
            s = unicode(filters.force_utf8(s).decode('utf-8'))

        RendererAgg.lock.acquire()
        try:
            self.math_text_parser.to_png(filename_or_obj, s, color=color, dpi=dpi, fontsize=fontsize)
        except (ParseFatalException, AttributeError):
            # Probably some invalid arguments supplied for math parser
            # We can most likely ignore them
            pass
        finally:
            RendererAgg.lock.release()
