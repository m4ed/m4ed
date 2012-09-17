def _force_unicode(text):
    if text == None:
        return u''

    if isinstance(text, unicode):
        return text

    try:
        text = unicode(text, 'utf-8')
    except UnicodeDecodeError:
        text = unicode(text, 'latin1')
    except TypeError:
        text = unicode(text)
    return text


def force_utf8(text):
    return str(_force_unicode(text).encode('utf8'))


class UTF8(unicode):
    def __init__(self, val):
        super(UTF8, self).__init__(force_utf8(val))
