import string
import copy

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
        return self.__iadd__(1)

    def __add__(self, val):
        if isinstance(val, int):
            pass
        elif isinstance(val, str):
            val = self._decode(val)
        elif isinstance(val, type(self)):
            val = int(val)
        else:
            raise TypeError('Invalid type')
        c = copy.deepcopy(self)
        c.base10_val += val
        c.val = self._encode(c.base10_val)
        return c

    def __iadd__(self, val):
        if isinstance(val, int):
            pass
        elif isinstance(val, str):
            val = self._decode(val)
        elif isinstance(val, type(self)):
            val = val.base10_val
        else:
            raise TypeError('Invalid type')
        self.base10_val += val
        self.val = self._encode(self.base10_val)
        return self

    def __int__(self):
        return self.base10_val

    def __str__(self):
        return self.val

    def __unicode__(self):
        return self.val
