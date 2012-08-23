from misaka import HtmlRenderer
from matplotlib.mathtext import MathTextParser
from matplotlib.mathtext import ParseFatalException

import re
#import os
import hashlib
# Python 3.0 stuff, equivalent to cStringIO in 2.7
from io import BytesIO

from redis.exceptions import ConnectionError


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
        self.math_regex = re.compile(r'\$\s*(.*?)\s*\$')
        self.img_regex = re.compile(r'(\!\[.*?\]\()id[=:]([a-zA-Z0-9]+)(\))')
        self.s_regex = re.compile(r'\s\s+')

    def preprocess(self, text, debug=False):
        # result = re.sub(r'\$\$(.*)\$\$', math_to_img, text, re.M)
        if debug:
            print '------------------------- preprocessing -------------------------'
        result = self.math_regex.sub(self.math_to_img, text)
        result = self.img_regex.sub(self.imgid_to_imgurl, result)
        return result

    def imgid_to_imgurl(self, match):
        matched_imgid = match.group(2)
        a = self.mongo_db.assets.find_one({'id': matched_imgid})
        if not a or not a.get('url'):
            return ('No image with id {} found! '
                'Please check your markdown'.format(matched_imgid))
        return match.group(1) + a.get('url', '') + match.group(3)

    def math_to_img(self, match, debug=False):
        redis_db = self.redis_db
        matched_math = match.group(1)
        # Normalize the spaces within the match and encode it
        matched_math = self.s_regex.sub(' ', matched_math).encode('utf-8')
        if debug:
            print matched_math

        m = hashlib.md5()
        m.update(matched_math)

        db_key = 'img:png:' + str(m.hexdigest())
        html = '<img alt="math" src="{}"></img>'.format(self.cache_route + db_key)
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

        _input = BytesIO('$' + matched_math + '$')
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
