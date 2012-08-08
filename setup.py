import os

from setuptools import setup, find_packages

here = os.path.abspath(os.path.dirname(__file__))
README = open(os.path.join(here, 'README.txt')).read()
CHANGES = open(os.path.join(here, 'CHANGES.txt')).read()

requires = [
    'pyramid',
    'pyramid_debugtoolbar',
    'pyramid_fanstatic',
    'js.lesscss'
    ]

setup(name='m4ed',
      version='0.0',
      description='m4ed',
      long_description=README + '\n\n' +  CHANGES,
      classifiers=[
        "Programming Language :: Python",
        "Framework :: Pylons",
        "Topic :: Internet :: WWW/HTTP",
        "Topic :: Internet :: WWW/HTTP :: WSGI :: Application",
        ],
      author='',
      author_email='',
      url='',
      keywords='web pyramid pylons',
      packages=find_packages(),
      include_package_data=True,
      zip_safe=False,
      install_requires=requires,
      tests_require=requires,
      test_suite="m4ed",
      entry_points="""\
      [paste.app_factory]
      main = m4ed:main

      # Fanstatic resource library
      [fanstatic.libraries]
      m4ed = m4ed.resources:library

      # A console script to serve the application and monitor static resources
      [console_scripts]
      pserve-fanstatic = m4ed.resources:pserve
      """,
      )
