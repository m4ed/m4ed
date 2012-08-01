from misaka import HtmlRenderer
from matplotlib.mathtext import MathTextParser
from matplotlib.mathtext import ParseFatalException

import redis

import re
#import os
import hashlib
# Python 3.0 stuff, equivalent to cStringIO in 2.7
from io import BytesIO


# TMP ROUTE should point to an URL where nginx with HTTPRedis
# module installed is listening
TMP_ROUTE = 'http://127.0.0.1:8081/cache?key='
CACHE_TIME = 1 * 60


class CustomHtmlRenderer(HtmlRenderer):
    def __init__(self):
        self.db = redis.StrictRedis()
        self.math_regex = re.compile(r'\$\s*(.*?)\s*\$')
        self.s_regex = re.compile(r'\s\s+')

    def preprocess(self, text):
        # result = re.sub(r'\$\$(.*)\$\$', math_to_img, text, re.M)
        print '------------------------- preprocessing -------------------------'
        result = self.math_regex.sub(self.math_to_img, text)
        return result

    def math_to_img(self, match):
        db = self.db
        matched_math = match.group(1)
        # Normalize the spaces within the match and encode it
        matched_math = self.s_regex.sub(' ', matched_math).encode('utf-8')
        print matched_math

        m = hashlib.md5()
        m.update(matched_math)

        db_key = 'img:png:' + str(m.hexdigest())
        html = '<img alt="math" src="{}"></img>'.format(TMP_ROUTE + db_key)
        if db.exists(db_key):
            print 'Cache hit! Serving the cached img and refreshing cache!'
            ttl = db.ttl(db_key)
            print 'The TTL remaining was', ttl, 'seconds => TTL now ', CACHE_TIME, 'seconds'
            # Refresh the cache expire timer
            db.expire(db_key, CACHE_TIME)
            return html
        print 'Cache miss! Generating a new img!'

        _input = BytesIO('$' + matched_math + '$')
        output = BytesIO()
        try:
            MathTextParser('bitmap').to_png(output, _input.getvalue(), 'black', 120, 10)
            db.set(db_key, output.getvalue())
            # Cache images for 1 minute(s)
            db.expire(db_key, CACHE_TIME)
        except ParseFatalException, e:
            print e
            return ''
        return html
