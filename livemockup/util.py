import string

BASE_LIST = string.digits + string.letters
BASE_DICT = dict((c, i) for i, c in enumerate(BASE_LIST))


class Base62(object):
    """ A simple base 62 encode/decoder

        Used to generate IDs in base 62 for shorter api urls """

    def __init__(self, val=None):
        if not val:
            self.base10_val = 0
            self.val = "0"
        elif (isinstance(val, int)):
            self.base10_val = val
            self.val = self._encode(val)
        elif (isinstance(val, str)):
            self.base10_val = self._decode(val)
            self.val = val
        else:
            raise TypeError('Valid input types are string or int')

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
        return self._add(1)

    def _add(self, val):
        if isinstance(val, str):
            val = self._decode(val)
        self.base10_val += val
        self.val = self._encode(self.base10_val)
        return self.val

    def __add__(self, val):
        self._add(val)
        return self

    def __iadd__(self, val):
        self._add(val)
        return self

    def __int__(self):
        return self.base10_val

    def __str__(self):
        return self.val

    def __unicode__(self):
        return self.val
