define([
  'jquery',
  'underscore',
  'backbone',
  'views/editor/templates',
  'lib/wysiwym/textarea'
],
function($, _, Backbone, templates, WysiwymTextarea) {
/*---------------------------------------------------------------------------*
 * m4ed Wysiwym editor - optimized for Markdown and Backbone
 * 
 * 
 * Forked from: 
 * http://pushingkarma.com/projects/jquery-wysiwym/
 * Not so Simple Wysiwym Editor Backbone view thingy
 * Version: 2.0 (2011-01-26)
 * Version: 2.1 (2011-07-23)
 * Version: 3.0 (2011-07-25)
 *---------------------------------------------------------------------------*/

  var textareaView = Backbone.View.extend({

    initialize: function(options) {
      _.extend(this, options.custom);
      this.dispatcher.on('editorButtonClick', this.onEditorButtonClick, this);

      // True to insert blank line when exiting auto-indent ;)
      this.linebreakAfterBlank = true;

      this.indentRegex = /^\*\s|(\d+)\.\s|\>\s|\s{3}\s+/;

      this.blankline = '';
    },

    render: function() {
      var $el = this.$el;
      this.textarea = new WysiwymTextarea(this.el);
    },

    events: {
      'keydown': 'onKeydown'
    },

    onKeydown: function(e) {
      console.log('Key is down! ' + e.which);
      // Only continue if keyCode === 13 or ctrl/meta key was pressed
      var key = e.which;
      //console.log(e);
      if (key === 13) {
        return this.handleIndent();
      } else if (e.altKey || e.shiftKey) {
        return true;
      } else if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        console.log('We should now handle a shortcut');
        return true;
        //this.handleShortcut(key);
      }
    },

    onEditorButtonClick: function(callback) {
      // callback action will be either span, block or list
      this[callback.action](callback.data);
    },

    handleIndent: function() {
      // ReturnKey pressed, lets indent!
      var textarea = this.textarea
        , selection = textarea.selection
        , linenum = textarea.refreshedSelection().start.line
        , line = this.textarea.lines[linenum]
        , postcursor = line.slice(textarea.selection.start.position, line.length);
      // Make sure nothing is selected & there is no text after the cursor
      if ((selection.length() !== 0) || (postcursor))
          return true;
      // So far so good; check for a matching indent regex
      var matches = line.match(this.indentRegex);
      if (matches) {
        var prefix = matches[0];
        var suffix = line.slice(prefix.length, line.length);
        // NOTE: If a selection is made in the regex, it's assumed that the
        // matching text is a number should be auto-incremented (ie: #. lists).
        if (matches.length === 2) {
          var num = parseInt(matches[1], 10);
          prefix = prefix.replace(matches[1], num + 1);
        }
        if (suffix) {
          // Regular auto-indent; Repeat the prefix
          selection.addPrefix('\n'+ prefix);
        } else {
          // Return on blank indented line (clear prefix)
          textarea.lines[linenum] = this.blankline;
          selection.start.position = selection.end.position = 0;
          if (this.linebreakAfterBlank) {
            selection.addPrefix('\n');
          }
        }
        textarea.update();
        return false;
      }
      return true;
    },

    handleShortcut: function(key) {
      // Check to see if we have a shortcut key and, if so click the according button.

      var buttons = markup.buttons;
      //var keyCodeStr = String.fromCharCode(keyCode).toLowerCase();
      keyStr = String.fromCharCode(key);

      buttons.forEach(function(button) {
        if (keyStr === button.key) {
          // If the shortcut key matches, prevent the default action
          // and click the button's jQuery element
          e.preventDefault();
          button.$el.click();
        }
      });
    },

    // Wrap the selected text with a prefix and suffix string.
    span: function(data) {
      var prefix = data.prefix    // (required) Text wrap prefix
        , suffix = data.suffix    // (required) Text wrap suffix
        , text = data.text        // (required) Default wrap text (if nothing selected)
        , textarea = this.textarea
        , selection = textarea.refreshedSelection();
      if (selection.isWrapped(prefix, suffix)) {
        selection.unwrap(prefix, suffix);
      } else if (selection.length() === 0) {
        selection.append(text);
        selection.wrap(prefix, suffix);
      } else {
        selection.wrap(prefix, suffix);
      }
      textarea.update();
    },

    // Prefix each line in the selection with the specified text.
    list: function(data) {
      var prefix = data.prefix    // (required) Line prefix text
        , wrap = data.wrap        // (optional) If true, wrap list with blank lines
        , regex = data.regex      // (optional) Set to regex matching prefix to increment num
        , textarea = this.textarea
        , selection = textarea.refreshedSelection();

      lineStart = regex ? new RegExp(regex) : prefix;

          // regex ? regex : prefix
          // regex ? eval(regex) : prefix
      if (selection.linesHavePrefix(lineStart)) {
        selection.removeLinePrefixes(lineStart);
        if (wrap) {
          selection.unwrapBlankLines();
        }
      } else {
        selection.setLinePrefixes(prefix, regex);
        if (wrap) {
          selection.wrapBlankLines();
        }
      }
      textarea.update();
    },

    // Prefix each line in the selection according based off the first selected line.
    block: function(data) {
      var markup = data.markup    // (required) Markup Language
        , prefix = data.prefix    // (required) Line prefix text
        , wrap = data.wrap        // (optional) If true, wrap list with blank lines
        , textarea = this.textarea
        , selection = textarea.refreshedSelection()
        , firstline = selection.getLines()[0];

      if (firstline.startswith(prefix)) {
        selection.removeLinePrefixes(prefix);
        if (wrap) {
          selection.unwrapBlankLines();
        }
      } else {
        selection.addLinePrefixes(prefix);
        if (wrap) {
          selection.wrapBlankLines();
        }
      }
      textarea.update();
    }
  });


  return textareaView;


//   /*----------------------------------------------------------------------------------------------
//    * Wysiwym handleShortcut
//    * Handles keyboard shortcuts
//    *--------------------------------------------------------------------------------------------- */
//   handleShortcut: function(e) {
//     //this.preventDefault();
//     e.stopPropagation();
//     var key = e.which;
//     if (key === 0) {
//         return false;
//     }
//     //console.log(e);
//     // Check to see if we have a shortcut key and, if so click the according button.
//     if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey) {

//       var buttons = markup.buttons;
//       //var keyCodeStr = String.fromCharCode(keyCode).toLowerCase();
//       keyStr = String.fromCharCode(key);

//       buttons.forEach(function(button) {
//         if (keyStr === button.key) {
//           // If the shortcut key matches, prevent the default action
//           // and click the button's jQuery element
//           e.preventDefault();
//           button.$el.click();
//         }
//       });
//     }
//   }
// };


// var markdown = {
//   buttons: [
//     [
//     new Button('Heading 1', {
//       icon: 'h1',
//       hidetext: true,
//       key: 'h'
//     }, 'span', {
//       prefix: '# ',
//       suffix: '',
//       text: 'Heading 1'
//     }),
//     new Button('Heading 2', {
//       icon: 'h2',
//       hidetext: true
//     }, 'span', {
//       prefix: '## ',
//       suffix: '',
//       text: 'Heading 2'
//     }),
//     new Button('Heading 3', {
//       icon: 'h3',
//       hidetext: true
//     }, 'span', {
//       prefix: '### ',
//       suffix: '',
//       text: 'Heading 3'
//     })

//     ],
//     [

//     new Button('Bold', {
//       icon: 'bold',
//       hidetext: true,
//       key: 'b'
//     }, 'span', {
//       prefix: '**',
//       suffix: '**',
//       text: 'strong text'
//     }),
//     new Button('Italic', {
//       icon: 'italic',
//       hidetext: true,
//       key: 'i'
//     }, 'span', {
//       prefix: '_',
//       suffix: '_',
//       text: 'italic text'
//     }),
//     new Button('Link', {
//       icon: 'link',
//       hidetext: true,
//       key: 'l'
//     }, 'span', {
//       prefix: '[',
//       suffix: '](http://example.com)',
//       text: 'link text'
//     })

//     ],
//     [

//     new Button('Bullet List', {
//       icon: 'list',
//       hidetext: true,
//       key: 'u'
//     }, 'list', {
//       prefix: '* ',
//       wrap: true
//     }),
//     new Button('Number List', {
//       icon: 'numbered-list',
//       hidetext: true,
//       key: 'o'
//     }, 'list', {
//       prefix: '0. ',
//       wrap: true,
//       regex: /^\s*\d+\.\s/
//     })

//     ],
//     [

//     new Button('Quote', {
//       icon: 'quote',
//       hidetext: true,
//       key: 'q'
//     }, 'list', {
//       prefix: '> ',
//       wrap: true
//     }),
//     new Button('Code', {
//       icon: 'code',
//       hidetext: true,
//       key: 'k'
//     }, 'block', {
//       prefix: '    ',
//       wrap: true
//     })

//     ]

//   ],

//   // Configure auto-indenting


//   // Syntax items to display in the help box
//   help: [
//     { label: 'Header', syntax: '## Header ##' },
//     { label: 'Bold',   syntax: '**bold**' },
//     { label: 'Italic', syntax: '_italics_' },
//     { label: 'Link',   syntax: '[pk!](http://google.com)' },
//     { label: 'Bullet List', syntax: '* list item' },
//     { label: 'Number List', syntax: '1. list item' },
//     { label: 'Blockquote', syntax: '&gt; quoted text' },
//     { label: 'Large Code Block', syntax: '(Begin lines with 4 spaces)' },
//     { label: 'Inline Code Block', syntax: '&lt;code&gt;inline code&lt;/code&gt;' }
//   ]
// };






//return Wysiwym;

});

