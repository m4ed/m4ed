define([
  'jquery',
  'underscore',
  'backbone',
  'hogan',
  'lib/wysiwym/textarea'
],
function($, _, Backbone, hogan, Textarea) {
/*----------------------------------------------------------------------------------------------
 * m4ed Wysiwym editor - optimized for Markdown
 * 
 * 
 * Forked from: 
 * http://pushingkarma.com/projects/jquery-wysiwym/
 * Simple Wysiwym Editor for jQuery
 * Version: 2.0 (2011-01-26)
 * Version: 2.1 (2011-07-23)
 *--------------------------------------------------------------------------------------------- */
//var Wysiwym = {};

  var wysiwym = Backbone.View.extend({

    initialize: function() {

      _.extend(this, options.custom);

      var options = {
        editorclass: 'wysiwym-editor',            // Class to use for the wysiwym editor
        buttonclass: 'wysiwym-buttons btn-toolbar',           // Class to use for the wysiwym button container
        helpclass: 'wysiwym-help',                // Class to use for the wysiwym help
        helptoggleclass: 'btn',                    // Class to use for the wysiwym help

        $buttonContainer: undefined,               // jQuery elem to place buttons (makes one by default)
        $help: undefined,                          // jQuery elem to place help (makes one by default)
        helpEnabled: false,                        // Set true to display the help dropdown
        $helpButton: undefined,                    // jQuery elem to toggle help (makes <a> by default)
        helpTextShow: 'Markup syntax',             // Toggle text to display when help is not visible
        helpTextHide: 'Hide markup syntax',        // Toggle text to display when help is visible
        helpIcon: 'question-sign',                 // Icon for the help button
        hideHelpButtonText: true                   // Boolean to hide text button
      }
      this.markup = markdown;                     // Wysiwym Markup set to use (markdown as default)
      this.textarea = new Textarea(this.el);      // The actual textarea element where we make changes

      this.templates = {
        editor: hogan.compile($('#wysiwym-editor-template').html()),
        button: hogan.compile($('#wysiwym-button-template').html())
      }
    },

    render: function() {

    }
  })

Wysiwym.prototype = {

  constructor: Wysiwym,

  init: function(type, element, options) {
    // Initialize the Wysiwym Editor
    this.type = type;
    this.options = this.getOptions(options);
    this.el = element;                          // Javascript textarea element
    this.$el = $(element);                      // jQuery textarea object



    this.editor = {
      editorclass: this.options.editorclass,
      containerclass: this.options.buttonclass,
      groups: []
    }

    this.blankline = '';

    this.initializeButtons();
    this.initializeAutoIndent();
    this.initializeShortcutHandler();
    this.initializeHelp();
    this.initializeHelpToggle();

    //this$

    console.log(this.editor);
    var hotomolo = this.templates.editor.render(this.editor);
    console.log(this.$el.parent().parent().html(hotomolo));
    //console.log(hotomolo);
  },

  getOptions: function (options) {
    options = $.extend({}, $.fn[this.type].defaults, options);
    return options;
  },

  // Add the button container and all buttons
  initializeButtons: function() {
    var self = this
      , markup = this.markup
      , textarea = this.textarea
    //   , $buttonContainer = this.options.$buttonContainer ||
    //                        $("<div></div>").insertBefore(this.$el);

    // $buttonContainer.addClass(this.options.buttonclass);

    // var $buttonGroup = $('<div class="btn-group"></div>');

    // var button = this.templates.button;
    // var a = this.templates.editor.render({

    // });

    //console.log(a);
    var groups = this.editor.groups;

    markup.buttons.forEach(function(buttonGroup) {
      //var $newGroup = $buttonGroup.clone();
      //$newGroup.appendTo($buttonContainer);
      var group = {
        buttons: []
      };
      buttonGroup.forEach(function(button) {
        b = button.init(self.textarea);
        group.buttons.push(b);
        //button.$el.on('click', $.proxy(self[button.callback], button));
        //$newGroup.append(button.$el);
      });
      groups.push(group);
      //console.log(group);
    });
  },

  // Initialize the AutoIndent trigger
  initializeAutoIndent: function() {
    if (!this.markup.autoindents) {
      return;
    }
    this.$el.on('keydown', $.proxy(this.autoIndent, this));
    
  },

  // Initialize the shortcut handler
  initializeShortcutHandler: function() {
    // Needs fixing
    //this.$el.bind('keydown', $.proxy(this.handleShortcut, this));
  },

  // Initialize the help syntax popover
  initializeHelp: function() {
    if (!this.options.helpEnabled) {
      return;
    }

    // Add the help table and items
    var $helpBody = $('<tbody></tbody>')
      , $helpTable = $(['<table class="table table-condensed table-striped">',
                        '</table>'].join('')).append($helpBody);
    for (var i in this.markup.help) {
      var item = this.markup.help[i];
      $helpBody.append([
        '<tr>',
          '<th>', item.label, '</th>',
          '<td>', item.syntax, '</td>',
        '</tr>'
      ].join(''));
    }

    this.options.$help = $helpTable;
  },

  // Initialize the Help Button
  initializeHelpToggle: function() {
    if (!this.options.helpEnabled) {
      return;
    }

    var $helpButton = this.options.$helpButton;
    if ($helpButton === undefined) {
      $helpButton = $("<a href='#' class='btn help-button pull-right'></a>");
      var $text = $("<span>"+ this.options.helpTextShow + "</span>");
      if (this.options.hideHelpButtonText) { $text.hide(); }
      var $i = $('<i class="icon-'+ this.options.helpIcon +'"></i>');
      $helpButton.prepend($i);

      this.options.$helpButton = $helpButton;
    }

    $helpButton.addClass(this.options.helptoggleclass);

    $helpButton.popover({
      title: 'Markdown help',
      content: this.options.$help,
      trigger: 'manual',
      delay: {
        show: 200,
        hide: 200
      }
    });

    $helpButton.on('click', function(e) {
      e.preventDefault();
      $(this).toggleClass('active');
      $(this).popover('toggle');
    });

    this.options.$buttonContainer.prepend($helpButton);

  },

  // Wrap the selected text with a prefix and suffix string.
  span: function(event) {
    var prefix = this.data.prefix;    // (required) Text wrap prefix
    var suffix = this.data.suffix;    // (required) Text wrap suffix
    var text = this.data.text;        // (required) Default wrap text (if nothing selected)
    //console.log('Inserting span');
    var textarea = this.textarea
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
  list: function(event) {
    var prefix = this.data.prefix;    // (required) Line prefix text
    var wrap = this.data.wrap;        // (optional) If true, wrap list with blank lines
    var regex = this.data.regex;      // (optional) Set to regex matching prefix to increment num
    var textarea = this.textarea
      , selection = textarea.refreshedSelection(); //selection.refresh();
    if (selection.linesHavePrefix(regex ? regex : prefix)) {
      selection.removeLinePrefixes(regex ? regex : prefix);
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
  block: function(event) {
    var markup = event.data.markup    // (required) Markup Language
      , prefix = event.data.prefix    // (required) Line prefix text
      , wrap = event.data.wrap        // (optional) If true, wrap list with blank lines
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
  },

  /*----------------------------------------------------------------------------------------------
   * Wysiwym AutoIndent
   * Handles auto-indentation when enter is pressed
   *--------------------------------------------------------------------------------------------- */
  autoIndent: function(event) {
    // Only continue if keyCode === 13
    if (event.keyCode !== 13)
        return true;
    // ReturnKey pressed, lets indent!
    //var markup = event.data.markup;    // Markup Language
    var textarea = this.textarea
      , linenum = textarea.refreshedSelection().start.line
      , line = textarea.lines[linenum]
      , postcursor = line.slice(textarea.selection.start.position, line.length);
    // Make sure nothing is selected & there is no text after the cursor
    if ((textarea.selection.length() !== 0) || (postcursor))
        return true;
    // So far so good; check for a matching indent regex
    var autoindents = this.markup.autoindents;
    for (var i in autoindents) {
      var regex = autoindents[i];
      var matches = line.match(regex);
      if (matches) {
        var prefix = matches[0];
        var suffix = line.slice(prefix.length, line.length);
        // NOTE: If a selection is made in the regex, it's assumed that the
        // matching text is a number should be auto-incremented (ie: #. lists).
        if (matches.length === 2) {
          var num = parseInt(matches[1], 10);
          prefix = prefix.replace(matches[1], num+1);
        }
        if (suffix) {
          // Regular auto-indent; Repeat the prefix
          textarea.selection.addPrefix('\n'+ prefix);
          textarea.update();
          return false;
        } else {
          // Return on blank indented line (clear prefix)
          textarea.lines[linenum] = this.blankline;
          textarea.selection.start.position = 0;
          textarea.selection.end.position = textarea.selection.start.position;
          if (markup.exitindentblankline) {
            textarea.selection.addPrefix('\n');
          }
          textarea.update();
          return false;
        }
      }
    }
    return true;
  },

  /*----------------------------------------------------------------------------------------------
   * Wysiwym handleShortcut
   * Handles keyboard shortcuts
   *--------------------------------------------------------------------------------------------- */
  handleShortcut: function(e) {
    //this.preventDefault();
    e.stopPropagation();
    var key = e.which;
    if (key === 0) {
        return false;
    }
    //console.log(e);
    // Check to see if we have a shortcut key and, if so click the according button.
    if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey) {

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
    }
  }
};


var markdown = {
  buttons: [
    [
    new Button('Heading 1', {
      icon: 'h1',
      hidetext: true,
      key: 'h'
    }, 'span', {
      prefix: '# ',
      suffix: '',
      text: 'Heading 1'
    }),
    new Button('Heading 2', {
      icon: 'h2',
      hidetext: true
    }, 'span', {
      prefix: '## ',
      suffix: '',
      text: 'Heading 2'
    }),
    new Button('Heading 3', {
      icon: 'h3',
      hidetext: true
    }, 'span', {
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
    }, 'span', {
      prefix: '**',
      suffix: '**',
      text: 'strong text'
    }),
    new Button('Italic', {
      icon: 'italic',
      hidetext: true,
      key: 'i'
    }, 'span', {
      prefix: '_',
      suffix: '_',
      text: 'italic text'
    }),
    new Button('Link', {
      icon: 'link',
      hidetext: true,
      key: 'l'
    }, 'span', {
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
    }, 'list', {
      prefix: '* ',
      wrap: true
    }),
    new Button('Number List', {
      icon: 'numbered-list',
      hidetext: true,
      key: 'o'
    }, 'list', {
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
    }, 'list', {
      prefix: '> ',
      wrap: true
    }),
    new Button('Code', {
      icon: 'code',
      hidetext: true,
      key: 'k'
    }, 'block', {
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




/*----------------------------------------------------------------------
 * Additional Javascript Prototypes
 *-------------------------------------------------------------------- */
String.prototype.strip = function() { return this.replace(/^\s+|\s+$/g, ''); };
String.prototype.lstrip = function() { return this.replace(/^\s+/, ''); };
String.prototype.rstrip = function() { return this.replace(/\s+$/, ''); };
String.prototype.startswith = function(str) { return this.slice(0, str.length) === str; };
String.prototype.endswith = function(str) { return this.slice(str.length, this.length) === str; };

//return Wysiwym;

});

