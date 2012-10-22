from fanstatic import Library
from js.lesscss import LessResource

library = Library('m4ed', 'resources')

editor_less = LessResource(library, 'less/editor.less')
student_less = LessResource(library, 'less/student.less')
preview_less = LessResource(library, 'less/preview.less')
login_less = LessResource(library, 'less/login.less')


def pserve():  # pragma: no cover
    """A script aware of static resource"""
    import pyramid.scripts.pserve
    import pyramid_fanstatic
    import os

    dirname = os.path.dirname(__file__)
    dirname = os.path.join(dirname, 'resources')
    pyramid.scripts.pserve.add_file_callback(
                pyramid_fanstatic.file_callback(dirname))
    pyramid.scripts.pserve.main()
