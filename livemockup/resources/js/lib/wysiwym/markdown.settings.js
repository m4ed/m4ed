// Filename: markdown.settings.js
define([
  'underscore',
  './wysiwym.callbacks'
],
function(_, callbacks) {

  /* ---------------------------------------------------------------------------
   * Wysiwym Markdown
   * Markdown markup language for the Wysiwym editor
   * Reference: http://daringfireball.net/projects/markdown/syntax
   *---------------------------------------------------------------------------- */
  // function Markdown() {}

  // Markdown.prototype.extend = function(obj) {
  //   _.extend(this, obj);
  // };

  // m = new Markdown();

  var markdown
    , cb = callbacks;

  markdown = {
    buttons: [
        [

        new Button('Heading 1', 
          {
            icon: 'h1',
            hidetext: true,
            key: 'h'
          },
          cb.span,
          {
            prefix: '# ',
            suffix: '',
            text: 'Heading 1'
          }
        ),
        new Button('Heading 2', {
            icon: 'h2',
            hidetext: true
        }, cb.span, {
            prefix: '## ',
            suffix: '',
            text: 'Heading 2'
        }), new Button('Heading 3', {
            icon: 'h3',
            hidetext: true
        }, cb.span, {
            prefix: '### ',
            suffix: '',
            text: 'Heading 3'
        })

        ],
        [

        new Button('Bold', {
            icon: 'bold',
            hidetext: true,
            key: 'b'
        }, cb.span, {
            prefix: '**',
            suffix: '**',
            text: 'strong text'
        }), new Button('Italic', {
            icon: 'italic',
            hidetext: true,
            key: 'i'
        }, cb.span, {
            prefix: '_',
            suffix: '_',
            text: 'italic text'
        }), new Button('Link', {
            icon: 'link',
            hidetext: true,
            key: 'l'
        }, cb.span, {
            prefix: '[',
            suffix: '](http://example.com)',
            text: 'link text'
        })

        ],
        [

        new Button('Bullet List', {
            icon: 'list',
            hidetext: true,
            key: 'u'
        }, cb.list, {
            prefix: '* ',
            wrap: true
        }), new Button('Number List', {
            icon: 'numbered-list',
            hidetext: true,
            key: 'o'
        }, cb.list, {
            prefix: '0. ',
            wrap: true,
            regex: /^\s*\d+\.\s/
        })

        ],
        [

        new Button('Quote', {
            icon: 'quote',
            hidetext: true,
            key: 'q'
        }, cb.list, {
            prefix: '> ',
            wrap: true
        }), new Button('Code', {
            icon: 'code',
            hidetext: true,
            key: 'k'
        }, cb.block, {
            prefix: '    ',
            wrap: true
        })

        ]

    ],

    // Configure auto-indenting
    exitindentblankline: true,    // True to insert blank line when exiting auto-indent ;)
    autoindents: [                // Regex lookups for auto-indent
        /^\s*\*\s/,                     // Bullet list
        /^\s*(\d+)\.\s/,                // Number list (number selected for auto-increment)
        /^\s*\>\s/,                     // Quote list
        /^\s{4}\s*/                     // Code block
    ],

    // Syntax items to display in the help box
    help: [
        { label: 'Header', syntax: '## Header ##' },
        { label: 'Bold',   syntax: '**bold**' },
        { label: 'Italic', syntax: '_italics_' },
        { label: 'Link',   syntax: '[pk!](http://google.com)' },
        { label: 'Bullet List', syntax: '* list item' },
        { label: 'Number List', syntax: '1. list item' },
        { label: 'Blockquote', syntax: '&gt; quoted text' },
        { label: 'Large Code Block', syntax: '(Begin lines with 4 spaces)' },
        { label: 'Inline Code Block', syntax: '&lt;code&gt;inline code&lt;/code&gt;' }
    ]
  };

    return markdown;
});
