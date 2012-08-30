from misaka import (
    Markdown,
    HtmlRenderer
    )
from matplotlib.mathtext import MathTextParser
from matplotlib.mathtext import ParseFatalException

import hashlib
# Python 3.0 stuff, equivalent to cStringIO in 2.7
from io import BytesIO
from HTMLParser import HTMLParser
from xml.sax.saxutils import quoteattr

from redis.exceptions import ConnectionError

import time

from m4ed.util import filters


class CustomHtmlRenderer(HtmlRenderer):
    def __new__(cls, flags=0, **kwargs):
        return super(CustomHtmlRenderer, cls).__new__(cls, flags)

    def __init__(self, *args, **kwargs):
        settings = kwargs.pop('settings')
        #print settings
        self.mongo_db = settings['db.mongo.conn'][settings['db.mongo.collection_name']]
        self.redis_db = settings['db.redis.conn']
        self.cache_route = settings['preview.img_cache_route']
        self.cache_time = int(settings['preview.img_cache_time'])

        #self.math_regex = re.compile(r'\$[\s\n]*(?P<math>.*?)[\s\n]*\$')
        #self.img_regex = re.compile(
            # r"""<img    # Start of an image tag
            #     \ src=  # The src part
            #         "id[ =:]?(?P<id>[a-zA-Z0-9]+)"
            #     \ alt=  # The alt text. Note that the "" are included within the match
            #         ?(?P<alt_text>.*?)
            #     >       # end image tag
            # """, re.X)
        #self.img_regex = re.compile(r'(?P<alt_text>\!\[.*?\]\()id[=:](?P<id>[a-zA-Z0-9]+)(\))')
        #self.s_regex = re.compile(r'\s\s+')
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

    @property
    def _404_img(self):
        return (
            'https://a9e01ec7324d40fdae33-8c4723fa6cef88b6ec249366d018b063'
            '.ssl.cf1.rackcdn.com/notfound.png'
        )

    def _normalize(self, text):
        return filters.force_utf8(' '.join(text.strip(' \t').split()))

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
        print "kwargs: ", kwargs
        try:
            data = kwargs.pop('data', None)
            if not data:
                data = kwargs.pop('default', '')
        except AttributeError:
            return ''
        print "data: ", data
        res = []
        lines = self.htmlparser.unescape(data).split('\n')
        print lines
        num_lines = len(lines)
        for i, line in enumerate(lines):
            if self._normalize(line) == '' and i != num_lines:
                res.append('<br />')
            else:
                res.append(self.math_to_img(line))

        return ''.join(res)

    def handle_multiple_choice_macro(self, kwargs):
        id_ctr = kwargs.pop('block_id', '0')
        tag = '<span id="m4ed-{id_ctr}"></span>'.format(id_ctr=id_ctr)
        data = kwargs.pop('data', '')
        multi_choice_args = []
        next_id = 0
        for line in data.split('\n'):
            line = self._normalize(line)
            line = line.split(' ', 1)
            try:
                line_starter = line[0]
                line_data = line[1]
            except IndexError:
                continue
            print repr(line_starter), repr(line_data)
            next_id += 1
            multi_choice_args.append({'id': next_id, 'pre': line_starter, 'text': line_data})
        #print 'THIS BE TEH DATA YOU LOOKING FO MAN', 
        self.post_process_blocks.append((
                tag,
                ('{tag}'
                '<script>'
                'require(["config"],'
                'function(){{'
                    'require(["views/student/multi"],'
                    'function(MultipleChoiceView){{'
                        'new MultipleChoiceView({{custom:{{'
                            'block_id:"#m4ed-{block_id}",'
                            'args:{args}'
                            '}}}});'
                    '}});'
                '}});'
                '</script>').format(tag=tag, block_id=id_ctr, args=str(multi_choice_args))
            ))
        return tag

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
            block_start_index = text.find(block_start_tag, block_start_index)
            if block_start_index < 0:
                break
            # Offset the start index by the length of start tag
            block_start_index += block_start_tag_len

            block_end_index = text.find(block_end_tag, block_start_index)
            while text[block_end_index - 1] == '\\':
                text = text[:block_end_index - 1] + text[block_end_index:]
                block_end_index = text.find(block_end_tag, block_end_index + block_end_tag_len)
                if  block_end_index < 0:
                    break
            if  block_end_index < 0:
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
            func_args = func_line[func_end + 1:].strip()
            # make keyword args:
            # args are separated with ","
            # each valid arg has arg=value
            kwargs = dict(data=data, block_id=block_id)

            # quotes = [
            #    '"',  # '&quot;',  # quote
            #    "'",  # '&#39;'    # apostrophe
            # ]

            first_quote = 0
            print 'MY ARGUMENST WERE', func_args
            while True:
                quot = func_args.find('"', first_quote)
                apos = func_args.find("'", first_quote)
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
                first_quote = func_args.find(q, first_quote)
                if first_quote < 0:
                    break
                # Move the first_quote starting pos so we don't unnecessarily
                # start find() from the same position
                first_quote += quote_offset
                second_quote = func_args.find(q, first_quote)
                if second_quote < 0:
                    break
                #print 'MY ARGS', func_args
                #print first_quote, second_quote
                # Escape the quoted text so it doesn't mess up our parser later on.
                # The 'entities' dictionary defines what characters we want to escape.
                # Example: "\alpha = \beta, 23" =>
                # &#92;alpha&#32;&#61;&#32;&#92;beta&#44;&#32;23
                escaped_text = quoteattr(
                        func_args[first_quote:second_quote],
                        entities=self.entities
                    )[quote_offset:-quote_offset]
                #func_args[first_quote:second_quote].replace(',', '&#44;').replace(' ', '&#32;').replace("'", '&#39;')
                #print 'QUOTED TEXT', escaped_text
                #print 'CAN WE FIND A COMMA? ...', 'YES' if escaped_text.find(',') != -1 else 'NO'
                func_args = (
                    func_args[:first_quote - quote_offset] +
                    escaped_text +
                    func_args[second_quote + quote_offset:]
                    )
                print 'MY ARGS', func_args

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
            if func_name not in self.funcs:
                block_start_index = block_end_index + block_end_tag_len  # after "]]"
                continue
            retval = self.funcs[func_name](kwargs)

            text = (
                text[:block_start_index - block_start_tag_len] +
                retval +
                text[block_end_index + block_end_tag_len:]
                )
            block_start_index += len(retval)
        if debug:
            print 'It took', (time.time() - start) * 1000, 'milliseconds to preprocess the preview'
        #return result
        return text

    def pastprocess(self, text, debug=True):
        if debug:
            print '------------------------- postprocessing -------------------------'
            start = time.time()

        result = self.img_regex.sub(self.imgid_to_imgurl, text)
        if debug:
            print 'It took', (time.time() - start) * 1000, 'milliseconds to postprocess the preview'

        return result

    def postprocess(self, text, debug=True):
        if debug:
            print '------------------------- postprocessing -------------------------'
            start = time.time()

        for tag, block in self.post_process_blocks:
            #print tag, block
            text = text.replace(tag, block)
        self.post_process_blocks = list()

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
        try:
            MathTextParser('bitmap').to_png(output, _input.getvalue(),
                color='black', dpi=120, fontsize=10)
            redis_db.set(db_key, output.getvalue())
            # Cache images for 1 minute(s)
            redis_db.expire(db_key, self.cache_time)
        except ParseFatalException, e:  # pragma: no cover
            print e
            return ''
        return html
