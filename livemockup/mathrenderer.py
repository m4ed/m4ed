from misaka import HtmlRenderer
from matplotlib.mathtext import MathTextParser
from matplotlib.mathtext import ParseFatalException
import random
import re
import os


TMP_FOLDER = 'livemockup/resources/img/tmp/'
TMP_ROUTE = '/fanstatic/livemockup/img/tmp/'


class MathRenderer(HtmlRenderer):
    def preprocess(self, text):
        clear_folder(TMP_FOLDER)
        # result = re.sub(r'\$\$(.*)\$\$', math_to_img, text, re.M)
        result = re.sub(r'\$(.*)\$', math_to_img, text)
        return result


def math_to_img(match):
    img_nr = str(random.randint(10000, 99999))

    # raw_text = raw_string(match.group(0))
    raw_text = raw(match.group(0))
    img = '![Alt text](' + TMP_ROUTE + img_nr + '.png)'
    print raw_text
    try:
        MathTextParser("bitmap").to_png(TMP_FOLDER + img_nr + '.png', raw_text, 'black', 120, 10)
    except ParseFatalException as e:
        print e
        return ''
    print img
    return img


escape_dict = {'\a': r'\a',
               '\b': r'\b',
               '\c': r'\c',
               '\f': r'\f',
               '\n': r'\n',
               '\r': r'\r',
               '\t': r'\t',
               '\v': r'\v',
               '\'': r'\'',
               '\"': r'\"',
               '\0': r'\0',
               '\1': r'\1',
               '\2': r'\2',
               '\3': r'\3',
               '\4': r'\4',
               '\5': r'\5',
               '\6': r'\6',
               '\7': r'\7',
               '\8': r'\8',
               '\9': r'\9'}


def raw(text):
    """Returns a raw string representation of text"""
    return "".join([escape_dict.get(char, char) for char in text])


def clear_folder(folder):
    for the_file in os.listdir(folder):
        file_path = os.path.join(folder, the_file)
        try:
            if os.path.isfile(file_path):
                os.unlink(file_path)
        except Exception, e:
            print e
