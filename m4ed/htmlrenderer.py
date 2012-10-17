import hashlib
import time
import json
import logging

from misaka import (
    Markdown,
    HtmlRenderer
    )

from matplotlib.mathtext import ParseFatalException
# We need this to acquire a lock to prevent multi threaded apps
# messing everything up
from matplotlib.backends.backend_agg import RendererAgg

# Python 3.0 stuff, equivalent to cStringIO in 2.7
from io import BytesIO
from HTMLParser import HTMLParser
from xml.sax.saxutils import quoteattr

from redis.exceptions import ConnectionError

from m4ed.util import filters

from string import Template

DEBUG = False

MULTI_CHOICE_TEMPLATE = Template((
    '${html_tag}'
    '<script>'
    'require(["student/models/multi", "student/views/multi"],'
    # MC <- returns MultipleChoice = student/models/multi.js
    # MCV <- returns MultipleChoiceView = student/views/multi.js
    # Using abbreviated terms since minifying is fun
    'function(MC,MCV){'
        'new MCV({'
            'model:new MC(${args}),'
            'custom:{'
              'block_id:"#m4ed-${block_id}"'
            '}'
        '});'
    '});'
    '</script>'
    ))

log = logging.getLogger(__name__)


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

        # keep all keys in lowercase!
        self.funcs = {
            'img': self.handle_image_macro,
            'image': self.handle_image_macro,
            'math': self.handle_math_macro,
            'multi': self.handle_multiple_choice_macro,
            'multi-choice': self.handle_multiple_choice_macro,
            'multiple-choice': self.handle_multiple_choice_macro
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

    def handle_image_macro(self, m_args):
        """
        format:
            [[img: id= url= alt= style= title=
            data
            ]]

        args:
            id = m4ed image reference
          OR
            url = external url when no id provided (no url arg present)

            alt = image alt text
            style = free style attributes
            title = image title

            data - rendered with sundown as is
        """
        default = m_args.pop('default', None)
        if default:
            imgid = default
            data = ''
        else:
            data = m_args.pop('data', None)
            if data:
                data = self.snippet_renderer.render(data)
            imgid = m_args.pop('id', None)

        argstr = ''
        if 'title' in m_args:
            argstr += 'title="{title} "'.format(title=m_args.pop('title', ''))
        if 'style' in m_args:
            argstr += 'style="{style}"'.format(style=m_args.pop('style', ''))

        return '<img alt="{alt}" src="{src}" {argstr} />{data}'.format(
            alt=m_args.pop('alt', ''),
            src=self.imgid_to_imgurl(imgid) if imgid else \
                m_args.pop('url', self._404_img),
            argstr=argstr,
            data=data
            )

    def handle_math_macro(self, m_args):
        if DEBUG:
            print "m_args: ", m_args
        try:
            data = m_args.pop('data', None)
            if not data:
                data = m_args.pop('default', '')
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

    def handle_multiple_choice_macro(self, m_args):
        block_id = m_args.pop('block_id', None)
        if block_id is None:
            raise ValueError('block_id was undefined')
        html_tag = '<span id="m4ed-{block_id}"></span>'.format(block_id=block_id)
        data = m_args.pop('data', '')
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
                'hint_class': 'success' if is_correct else 'error'
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

    def _find_all(self, text, sub):
        """Finds all occurrences of sub from text, return generators"""
        start = 0
        while True:
            start = text.find(sub, start)
            if start == -1:
                return
            yield start
            start += len(sub) - 1

    def preprocess(self, text, debug=True):
        if debug:
            #print 'markdown PRE ---->'
            _mark = time.time()

        starts = list(self._find_all(text, "[["))
        ends = list(self._find_all(text, "]]"))

        if len(starts) == 0:
            # no macros to process, return original text
            return text

        # strip out escaped starts '\[['
        # check needed for "[[macro]]\" as x-1 at the pos 0 is last char of string
        if starts[0] != 0:
            starts[:] = [x for x in starts if not text[x - 1] == '\\']
        else:
            starts[1:] = [x for x in starts[1:] if not text[x - 1] == '\\']

        # strip out escaped ends '\]]'
        ends[:] = [x for x in ends if not text[x - 1] == '\\']

        stack = []
        macros = []
        while ends:
            while (len(starts) > 0) and (starts[0] < ends[0]):
                stack.append(starts.pop(0))
            if stack:
                macro = ((stack.pop(), ends.pop(0) + 2))
                macros.append(macro)
            else:
                # handles "]][[" situation
                ends.pop(0)

        # macros are in such order that innermost ones come first so we can
        # process them as they are. [[3. [[1.]] [[2.]]]] [[4.]]
        block_id = 0
        while len(macros) > 0:
            m = macros.pop(0)
            macro = text[m[0] + 2:m[1] - 2]
            func = macro.split(":", 1)
            # func name = func[0], rest is func[1]
            # if no args, it's all in func[0]
            func[0] = func[0].lower()
            if func[0] not in self.funcs:
                continue
            if len(func) > 1:
                f_args = {}
                func_data = func[1].split("\n", 1)
                func_args = self.parse_quotes(func_data[0])
                func_args = func_args.strip().split(",")
                for arg in func_args:
                    arg = arg.strip().split("=")
                    if len(arg) == 2:
                        #[[macro: arg=val, arg=val]]
                        f_args[arg[0].strip().lower()] = arg[1].strip()
                    else:
                        #[[macro: single arg]]
                        #[[macro: key=value, single arg -> default]]
                        #[[macro: default=val, key=val, single arg <discard]]
                        if not f_args.get('default'):
                            # do not override default arg if specified by user
                            f_args['default'] = arg[0].strip()
                f_args["data"] = func_data[1] if len(func_data) > 1 else ""
                f_args["block_id"] = f_args.get("name", block_id)
                ret = self.funcs[func[0]](f_args)
            else:
                ret = self.funcs[func[0]]()
            block_id += 1

            # change is the difference between original and macro returned data
            change = len(ret) - (m[1] - m[0])
            if m[0] == 0:
                text = ret + text[m[1]:]
            else:
                text = text[:m[0]] + ret + text[m[1]:]

            # now we need to re-adjust indexes
            for x, i in enumerate(macros):
                start = i[0]
                end = i[1]

                # [[this macro]] [[processed macro]] = after >> no change
                # [[processed macro]] [[this macro]] = before >> change both
                #                                      start += change, end += change
                # [[this [[processed macro]] macro]] = inside >> change end += change
                # [[processed [[this macro]] macro]] = impossible as inner macros
                #                                      get always processed first
                if m[1] <= i[0]:
                    start += change
                    end += change
                elif i[0] < m[0] and i[1] > m[1]:
                    end += change

                macros[x] = (start, end)

        if debug:
            print 'misaka  preprocess /->', (time.time() - _mark) * 1000, 'ms'
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
        """preprocess --> markdownrender --> [text] postprocess"""
        if debug:
            #print '------------------------- postprocessing -------------------------'
            _mark = time.time()
        for tag, block in self.post_process_blocks:
            #print tag, block
            text = text.replace(tag, block)
        #self.post_process_blocks = list()

        if debug:
            print 'misaka postprocess \\->', (time.time() - _mark) * 1000, 'ms\n'

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
                    log.info('Cache miss! Generating a new img!')
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
