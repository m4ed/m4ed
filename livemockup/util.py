import string

BASE_LIST = string.digits + string.letters
BASE_DICT = dict((c, i) for i, c in enumerate(BASE_LIST))


class Base62(object):
    """ A simple base 62 encode/decoder

        Used to generate IDs in base 62 for shorter api urls """

    def __init__(self, val):
        if (isinstance(val, int)):
            val = str(val)

        self.val = val
        self.base10_val = self._decode(val)

    def _decode(self, strng, reverse_base=BASE_DICT):
        length = len(reverse_base)
        res = 0
        for i, c in enumerate(strng[::-1]):
            res += (length ** i) * reverse_base[c]

        return res

    def _encode(self, integer, base=BASE_LIST):
        length = len(base)
        res = ''
        while integer != 0:
            res = base[integer % length] + res
            integer /= length
        return res

    def increment(self):
        self.base10_val += 1
        self.val = self._encode(self.base10_val)
        return self.val

    def __int__(self):
        return self.base10_val

    def __str__(self):
        return self.val

    def __unicode__(self):
        return self.val
