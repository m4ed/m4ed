define([
    'jquery'
],
function($) {

/*----------------------------------------------------------------------------------------------
 * m4ed Wysiwym editor - optimized for Markdown
 * 
 * 
 * Forked from: 
 * http://pushingkarma.com/projects/jquery-wysiwym/
 * Simple Wysiwym Editor for jQuery
 * Version: 2.0 (2011-01-26)
 *--------------------------------------------------------------------------------------------- */
var BLANKLINE = '';
//var Wysiwym = {};


$.fn.wysiwym = function(options) {
    this.EDITORCLASS = 'wysiwym-editor';           // Class to use for the wysiwym editor
    this.BUTTONCLASS = 'wysiwym-buttons';          // Class to use for the wysiwym button container
    this.HELPCLASS = 'wysiwym-help';               // Class to use for the wysiwym help
    this.HELPTOGGLECLASS = 'btn';                  // Class to use for the wysiwym help
    this.textelem = this;                          // Javascript textarea element
    this.$textarea = $(this);                      // jQuery textarea object
    this.$editor = undefined;
    this.markup = new Markdown();                  // Wysiwym Markup set to use (markdown as default)
    this.textarea = new Textarea(this.textelem);   // The actual textarea element where we make changes
    this.defaults = {                              // Default option values
        $buttonContainer: undefined,               // jQuery elem to place buttons (makes one by default)
        $help: undefined,                          // jQuery elem to place help (makes one by default)
        helpEnabled: false,                        // Set true to display the help dropdown
        $helpButton: undefined,                    // jQuery elem to toggle help (makes <a> by default)
        helpTextShow: 'Markup syntax',             // Toggle text to display when help is not visible
        helpTextHide: 'Hide markup syntax',        // Toggle text to display when help is visible
        helpIcon: 'question-sign',                 // Icon for the help button
        hideHelpButtonText: true                   // Boolean to hide text button
    };
    this.options = $.extend(this.defaults, options ? options : {});

    // Add the button container and all buttons
    this.initializeButtons = function() {
        var markup = this.markup
          , textarea = this.textarea;
        if (this.options.$buttonContainer === undefined)
            this.options.$buttonContainer = $("<div></div>").insertBefore(this.$textarea);

        $buttonContainer = this.options.$buttonContainer;
        $buttonContainer.addClass(this.BUTTONCLASS);

        var $buttonGroup = $('<div class="btn-group"></div>');

        markup.buttons.forEach(function(buttonGroup) {
            var $newGroup = $buttonGroup.clone();
            $newGroup.appendTo($buttonContainer);
            buttonGroup.forEach(function(button) {
                button.create();
                var data = $.extend({textarea: textarea}, button.data);
                button.$el.on('click', data, button.callback);
                $newGroup.append(button.$el);
            });
        });
    };

    // Initialize the AutoIndent trigger
    this.initializeAutoIndent = function() {
        if (this.markup.autoindents) {
            var data = {textarea: this.textarea};
            this.$textarea.bind('keydown', data, callbacks.autoIndent);
        }
    };

    // Initialize the shortcut handler
    this.initializeShortcutHandler = function() {
        var data = {textarea: this.textarea};
        this.$textarea.bind('keydown', data, callbacks.handleShortcut);
    };

    // Initialize the help syntax popover
    this.initializeHelp = function() {
        if (this.options.helpEnabled) {

            // Add the help table and items
            var $helpBody = $('<tbody></tbody>');
            var $helpTable = $('<table class="table table-condensed table-striped"></table>').append($helpBody);
            for (var i=0; i<this.markup.help.length; i++) {
                var item = this.markup.help[i];
                $helpBody.append('<tr><th>'+ item.label +'</th><td>'+ item.syntax +'</td></tr>');
            }

            this.options.$help = $helpTable;

        }

    };

    // Initialize the Help Button
    this.initializeHelpToggle = function() {
        if (this.options.helpEnabled) {

            var $helpButton = this.options.$helpButton;
            if ($helpButton === undefined) {
                $helpButton = $("<a href='#' class='btn help-button pull-right'></a>");
                var $text = $("<span>"+ this.options.helpTextShow + "</span>");
                if (this.options.hideHelpButtonText) $text.hide();
                var $i = $('<i class="icon-'+ this.options.helpIcon +'"></i>');
                $helpButton.prepend($i);

                this.options.$helpButton = $helpButton;
            }

            $helpButton.addClass(this.HELPTOGGLECLASS);

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

        }
    };

    // Initialize the Wysiwym Editor
    this.$editor = $('<div class="'+ this.EDITORCLASS +'"></div>');
    this.$textarea.wrap(this.$editor);
    this.initializeButtons();
    this.initializeAutoIndent();
    this.initializeShortcutHandler();
    this.initializeHelp();
    this.initializeHelpToggle();
};


/*----------------------------------------------------------------------------------------------
 * Wysiwym Selection
 * Manipulate the textarea selection
 *--------------------------------------------------------------------------------------------- */
function Selection(textarea) {
    this.textarea = textarea;
    this.lines = textarea.lines;                 // Reference to textarea.lines
    this.start = { line:0, position:0 };        // Current cursor start positon
    this.end = { line:0, position:0 };          // Current cursor end position
}

var sel = Selection.prototype;

sel.reset = function() {
    this.lines = this.textarea.lines;
};

// Return a string representation of this object.
sel.toString = function() {
    var str = 'SELECTION: '+ this.length() +' chars\n';
    str += 'START LINE: '+ this.start.line +'; POSITION: '+ this.start.position +'\n';
    str += 'END LINE: '+ this.end.line +'; POSITION: '+ this.end.position +'\n';
    return str;
};

// Add a line prefix, reguardless if it's already set or not.
sel.addLinePrefixes = function(prefix) {
    for (var i=this.start.line; i <= this.end.line; i++) {
        this.lines[i] = prefix + this.lines[i];
    }
    this.start.position += prefix.length;
    this.end.position += prefix.length;
};

// Add the specified prefix to the selection
sel.addPrefix = function(prefix) {
    var numlines = this.lines.length;
    var line = this.lines[this.start.line];
    var newline = line.substring(0, this.start.position) +
        prefix + line.substring(this.start.position, line.length);
    this.lines[this.start.line] = newline;
    this.start.position += prefix.length;
    if (this.start.line == this.end.line)
        this.end.position += prefix.length;
    // Check we need to update the scroll height;  This is very slightly
    // off because height != scrollHeight. A fix would be nice.
    if (prefix.indexOf('\n') != -1) {
        var scrollHeight = this.textarea.textelem.scrollHeight;
        var lineheight = parseInt(scrollHeight / numlines, 10);
        this.textarea.scroll += lineheight;
    }

};

// Add the specified suffix to the selection
sel.addSuffix = function(suffix) {
    var line = this.lines[this.end.line];
    var newline = line.substring(0, this.end.position) +
        suffix + line.substring(this.end.position, line.length);
    this.lines[this.end.line] = newline;
};

// Append the specified text to the selection
sel.append = function(text) {
    var line = this.lines[this.end.line];
    var newline = line.substring(0, this.end.position) +
        text + line.substring(this.end.position, line.length);
    this.lines[this.end.line] = newline;
    this.end.position += text.length;
};

// Return an array of lines in the selection
sel.getLines = function() {
    var selectedlines = [];
    for (var i=this.start.line; i <= this.end.line; i++)
        selectedlines[selectedlines.length] = this.lines[i];
    return selectedlines;
};

// Return true if selected text contains has the specified prefix
sel.hasPrefix = function(prefix) {
    var line = this.lines[this.start.line];
    var start = this.start.position - prefix.length;
    if ((start < 0) || (line.substring(start, this.start.position) != prefix))
        return false;
    return true;
};

// Return true if selected text contains has the specified suffix
sel.hasSuffix = function(suffix) {
    var line = this.lines[this.end.line];
    var end = this.end.position + suffix.length;
    if ((end > line.length) || (line.substring(this.end.position, end) != suffix))
        return false;
    return true;
};

// Insert the line before the selection to the specified text. If force is
// set to false and the line is already set, it will be left alone.
sel.insertPreviousLine = function(newline, force) {
    force = force !== undefined ? force : true;
    var prevnum = this.start.line - 1;
    if ((force) || ((prevnum >= 0) && (this.lines[prevnum] != newline))) {
        this.lines.splice(this.start.line, 0, newline);
        this.start.line += 1;
        this.end.line += 1;
    }
};

// Insert the line after the selection to the specified text. If force is
// set to false and the line is already set, it will be left alone.
sel.insertNextLine = function(newline, force) {
    force = force !== undefined ? force : true;
    var nextnum = this.end.line + 1;
    if ((force) || ((nextnum < this.lines.length) && (this.lines[nextnum] != newline)))
        this.lines.splice(nextnum, 0, newline);
};

// Return true if selected text is wrapped with prefix & suffix
sel.isWrapped = function(prefix, suffix) {
    return ((this.hasPrefix(prefix)) && (this.hasSuffix(suffix)));
};

// Return the selection length
sel.length = function() {
    return this.val().length;
};

// Return true if all lines have the specified prefix. Optionally
// specify prefix as a regular expression.
sel.linesHavePrefix = function(prefix) {
    for (var i=this.start.line; i <= this.end.line; i++) {
        var line = this.lines[i];
        if ((typeof(prefix) == 'string') && (!line.startswith(prefix))) {
            return false;
        } else if ((typeof(prefix) != 'string') && (!line.match(prefix))) {
            return false;
        }
    }
    return true;
};

// Prepend the specified text to the selection
sel.prepend = function(text) {
    var line = this.lines[this.start.line];
    var newline = line.substring(0, this.start.position) +
        text + line.substring(this.start.position, line.length);
    this.lines[this.start.line] = newline;
    // Update Class Variables
    if (this.start.line == this.end.line)
        this.end.position += text.length;
};

// Remove the prefix from each line in the selection. If the line
// does not contain the specified prefix, it will be left alone.
// Optionally specify prefix as a regular expression.
sel.removeLinePrefixes = function(prefix) {
    for (var i=this.start.line; i <= this.end.line; i++) {
        var line = this.lines[i];
        var match = prefix;
        // Check prefix is a regex
        if (typeof(prefix) != 'string')
            match = line.match(prefix)[0];
        // Do the replace
        if (line.startswith(match)) {
            this.lines[i] = line.substring(match.length, line.length);
            if (i == this.start.line)
                this.start.position -= match.length;
            if (i == this.end.line)
                this.end.position -= match.length;
        }

    }
};

// Remove the previous line. If regex is specified, it will
// only be removed if there is a match.
sel.removeNextLine = function(regex) {
    var nextnum = this.end.line + 1;
    var removeit = false;
    if ((nextnum < this.lines.length) && (regex) && (this.lines[nextnum].match(regex)))
        removeit = true;
    if ((nextnum < this.lines.length) && (!regex))
        removeit = true;
    if (removeit)
        this.lines.splice(nextnum, 1);
};

// Remove the specified prefix from the selection
sel.removePrefix = function(prefix) {
    if (this.hasPrefix(prefix)) {
        var line = this.lines[this.start.line];
        var start = this.start.position - prefix.length;
        var newline = line.substring(0, start) +
            line.substring(this.start.position, line.length);
        this.lines[this.start.line] = newline;
        this.start.position -= prefix.length;
        if (this.start.line == this.end.line)
            this.end.position -= prefix.length;
    }
};

// Remove the previous line. If regex is specified, it will
// only be removed if there is a match.
sel.removePreviousLine = function(regex) {
    var prevnum = this.start.line - 1;
    var removeit = false;
    if ((prevnum >= 0) && (regex) && (this.lines[prevnum].match(regex)))
        removeit = true;
    if ((prevnum >= 0) && (!regex))
        removeit = true;
    if (removeit) {
        this.lines.splice(prevnum, 1);
        this.start.line -= 1;
        this.end.line -= 1;
    }
};

// Remove the specified suffix from the selection
sel.removeSuffix = function(suffix) {
    if (this.hasSuffix(suffix)) {
        var line = this.lines[this.end.line];
        var end = this.end.position + suffix.length;
        var newline = line.substring(0, this.end.position) +
            line.substring(end, line.length);
        this.lines[this.end.line] = newline;
    }
};

// Set the prefix of each selected line. If the prefix is already and
// set, the line willl be left alone.
sel.setLinePrefixes = function(prefix, increment) {
    increment = increment ? increment : false;
    for (var i=this.start.line; i <= this.end.line; i++) {
        if (!this.lines[i].startswith(prefix)) {
            // Check if prefix is incrementing
            if (increment) {
                var num = Integer.parseInt(prefix.match(/\d+/)[0]);
                prefix = prefix.replace(num, num+1);
            }
            // Add the prefix to the line
            var numspaces = this.lines[i].match(/^\s*/)[0].length;
            this.lines[i] = this.lines[i].lstrip();
            this.lines[i] = prefix + this.lines[i];
            if (i == this.start.line)
                this.start.position += prefix.length - numspaces;
            if (i == this.end.line)
                this.end.position += prefix.length - numspaces;
        }
    }
};

// Unwrap the selection prefix & suffix
sel.unwrap = function(prefix, suffix) {
    this.removePrefix(prefix);
    this.removeSuffix(suffix);
};

// Remove blank lines from before and after the selection.  If the
// previous or next line is not blank, it will be left alone.
sel.unwrapBlankLines = function() {
    this.textarea.selection.removePreviousLine(/^\s*$/);
    this.textarea.selection.removeNextLine(/^\s*$/);
};

// Return the selection value
sel.val = function() {
    var value = '';
    for (var i=0; i < this.lines.length; i++) {
        var line = this.lines[i];
        if ((i == this.start.line) && (i == this.end.line)) {
            return line.substring(this.start.position, this.end.position);
        } else if (i == this.start.line) {
            value += line.substring(this.start.position, line.length) +'\n';
        } else if ((i > this.start.line) && (i < this.end.line)) {
            value += line +'\n';
        } else if (i == this.end.line) {
            value += line.substring(0, this.end.position);
        }
    }
    return value;
};

// Wrap the selection with the specified prefix & suffix
sel.wrap = function(prefix, suffix) {
    this.addPrefix(prefix);
    this.addSuffix(suffix);
};

// Wrap the selected lines with blank lines.  If there is already
// a blank line in place, another one will not be added.
sel.wrapBlankLines = function() {
    if (this.textarea.selection.start.line > 0)
        this.textarea.selection.insertPreviousLine(BLANKLINE, false);
    if (this.textarea.selection.end.line < this.textarea.lines.length - 1)
        this.textarea.selection.insertNextLine(BLANKLINE, false);
};

/*----------------------------------------------------------------------------------------------
 * Wysiwym Textarea
 * This can used used for some or all of your textarea modifications. It will keep track of
 * the the current text and selection positions. The general idea is to keep track of the
 * textarea in terms of Line objects.  A line object contains a lineType and supporting text.
 *--------------------------------------------------------------------------------------------- */
function Textarea(el) {
    this.textelem = el.get(0);                      // Javascript textarea element
    this.$textarea = $(el);                         // jQuery textarea object
    this.lines = [];                                // Current textarea lines
    this.selection = new Selection(this);           // Selection properties & manipulation
    this.scroll = this.textelem.scrollTop;          // Current cursor scroll position
}

var ta = Textarea.prototype;

ta.init = function() {
    // Initialize the Textarea
    this.lines = [];
    this.selection.reset();
    var text = this.textelem.value.replace(/\r\n/g, '\n');
    var selectionInfo = this.getSelectionStartEnd(this.textelem);
    var selectionStart = selectionInfo[0];
    var selectionEnd = selectionInfo[1];
    console.log(selectionStart);
    console.log(selectionEnd);
    var endline = 0;
    while (endline >= 0) {
        endline = text.indexOf('\n');
        var line = text.substring(0, endline >= 0 ? endline : text.length);
        if ((selectionStart <= line.length) && (selectionEnd >= 0)) {
            if (selectionStart >= 0) {
                this.selection.start.line = this.lines.length;
                this.selection.start.position = selectionStart;
            }
            if (selectionEnd <= line.length) {
                this.selection.end.line = this.lines.length;
                this.selection.end.position = selectionEnd;
            }
        }
        this.lines[this.lines.length] = line;
        text = endline >= 0 ? text.substring(endline + 1, text.length) : '';
        selectionStart -= endline + 1;
        selectionEnd -= endline + 1;
    }
    // Tweak the selection end position if its on the edge
    if ((this.selection.end.position === 0) && (this.selection.end.line != this.selection.start.line)) {
        this.selection.end.line -= 1;
        this.selection.end.position = this.lines[this.selection.end.line].length;
    }

    //console.log(this.selection.toString());
    //console.log('We have reached the end');
    return this;
};

// Return a string representation of this object.
ta.toString = function() {
    var str = 'TEXTAREA: #'+ this.$textarea.attr('id') +'\n';
    str += this.selection.toString();
    str += 'SCROLL: '+ this.scroll +'px\n';
    str += '---\n';
    for (var i=0; i<this.lines.length; i++)
        str += 'LINE '+ i +': '+ this.lines[i] +'\n';
    return str;
};

// Return the current text value of this textarea object
ta.getProperties = function() {
    var newtext = []            // New textarea value
      , textLength = 0
      , selectionStart = 0      // Absolute cursor start position
      , selectionEnd = 0;       // Absolute cursor end position
    //console.log('There are ' + this.lines.length + ' lines');
    for (var i = 0, j = this.lines.length; i < j; i++) {
        if (i == this.selection.start.line)
            selectionStart = textLength + this.selection.start.position;
        if (i == this.selection.end.line)
            selectionEnd = textLength + this.selection.end.position;
        newtext.push(this.lines[i]);
        textLength += this.lines[i].length;
        if (i != this.lines.length - 1) {
            newtext.push('\n');
            textLength += 1;
        }
    }
    return [newtext.join(''), selectionStart, selectionEnd];
};

// Return the absolute start and end selection postions
// StackOverflow #1: http://goo.gl/2vSnF
// StackOverflow #2: http://goo.gl/KHm0d
ta.getSelectionStartEnd = function() {

    var startpos, endpos;
    if (typeof(this.textelem.selectionStart) == 'number') {
        startpos = this.textelem.selectionStart;
        endpos = this.textelem.selectionEnd;
    } else {
        this.textelem.focus();
        var text = this.textelem.value.replace(/\r\n/g, '\n');
        var textlen = text.length;
        var range = document.selection.createRange();
        var textrange = this.textelem.createTextRange();
        textrange.moveToBookmark(range.getBookmark());
        var endrange = this.textelem.createTextRange();
        endrange.collapse(false);
        if (textrange.compareEndPoints('StartToEnd', endrange) > -1) {
            startpos = textlen;
            endpos = textlen;
        } else {
            startpos = -textrange.moveStart('character', -textlen);
            //startpos += text.slice(0, startpos).split('\n').length - 1;
            if (textrange.compareEndPoints('EndToEnd', endrange) > -1) {
                endpos = textlen;
            } else {
                endpos = -textrange.moveEnd('character', -textlen);
                //endpos += text.slice(0, endpos).split('\n').length - 1;
            }
        }
    }
    // console.log('START AND END');
    // console.log(startpos);
    // console.log(endpos);
    return [startpos, endpos];
};

// Update the textarea with the current lines and cursor settings
ta.update = function() {
    var properties = this.getProperties();
    console.log(properties);
    var newtext = properties[0];
    var selectionStart = properties[1];
    var selectionEnd = properties[2];
    this.$textarea.val(newtext);
    if (this.textelem.setSelectionRange) {
        this.textelem.setSelectionRange(selectionStart, selectionEnd);
    } else if (this.textelem.createTextRange) {
        var range = this.textelem.createTextRange();
        range.collapse(true);
        range.moveStart('character', selectionStart);
        range.moveEnd('character', selectionEnd - selectionStart);
        range.select();
    }
    this.textelem.scrollTop = this.scroll;
    this.$textarea.focus();
};





/*----------------------------------------------------------------------------------------------
 * Wysiwym Button
 * Represents a single button in the Wysiwym editor.
 *--------------------------------------------------------------------------------------------- */
function Button(name, options, callback, data, cssclass) {
    this.$el = null;                   // jQuery element for this button
    this.name = name;                  // Button Name
    this.icon = options.icon;          // Icon name
    this.shortcutKey = options.key;    // Shortcut (CTRL + <key>)
    this.tooltip = name;
    if (this.shortcutKey) {
        this.tooltip += ' - ' + 'CTRL + ' + this.shortcutKey.toUpperCase();
    }                                  // Tooltip (name | name + shortcut)
    this.callback = callback;          // Callback function for this button
    this.data = data ? data : {};      // Callback arguments
    this.cssclass = cssclass;          // CSS Class to apply to button
    this.hidetext = options.hidetext ? options.hidetext : false;  // Show icon only?
}

var btn = Button.prototype;

// Return the CSS Class for this button
btn.getCssClass = function() {
    return this.cssclass ? this.cssclass : this.name.toLowerCase().replace(' ', '');
};

// Create and return a new Button jQuery element
btn.create = function() {
    var $text = $('<span class="text">'+ this.name +'</span>');
    var $i = $('<i class="icon-'+ this.icon +'"></i>');
    var $wrap = $('<span class="wrap"></span>').append($text);
    if (this.hidetext) $text.hide();
    if (this.icon !== undefined) $wrap.append($i);
    var $button = $('<div class="button btn"></div>').append($wrap);
    // Add bootstrap tooltip
    $button.tooltip({
        title: this.tooltip,
        delay: {
            show: 1500,
            hide: 200
        }
    });
    $button.addClass(this.getCssClass());
    // Make everything 'unselectable' so IE doesn't freak out
    $text.attr('unselectable', 'on');
    $wrap.attr('unselectable', 'on');
    $button.attr('unselectable', 'on');
    // Attach jQuery element so we can access it easily
    this.$el = $button;
};


/*----------------------------------------------------------------------------------------------
 * Wysiwym Button Callbacks
 * Useful functions to help easily create Wysiwym buttons
 *--------------------------------------------------------------------------------------------- */

//exports = module.exports = Wysiwym

var callbacks = {}
  , cb = callbacks;

// function Callbacks() {
//     console.log('I am actually getting initialized');
// }

// Wrap the selected text with a prefix and suffix string.
cb.span = function(event) {
    var prefix = event.data.prefix;    // (required) Text wrap prefix
    var suffix = event.data.suffix;    // (required) Text wrap suffix
    var text = event.data.text;        // (required) Default wrap text (if nothing selected)
    //console.log('Inserting span');
    var textarea = event.data.textarea.init()
      , selection = textarea.selection;
    if (selection.isWrapped(prefix, suffix)) {
        selection.unwrap(prefix, suffix);
    } else if (selection.length() === 0) {
        selection.append(text);
        selection.wrap(prefix, suffix);
    } else {
        selection.wrap(prefix, suffix);
    }
    textarea.update();
};

// Prefix each line in the selection with the specified text.
cb.list = function(event) {
    var prefix = event.data.prefix;    // (required) Line prefix text
    var wrap = event.data.wrap;        // (optional) If true, wrap list with blank lines
    var regex = event.data.regex;      // (optional) Set to regex matching prefix to increment num
    var textarea = event.data.textarea.init()
      , selection = textarea.selection;
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
};

// Prefix each line in the selection according based off the first selected line.
cb.block = function(event) {
    var markup = event.data.markup;    // (required) Markup Language
    var prefix = event.data.prefix;    // (required) Line prefix text
    var wrap = event.data.wrap;        // (optional) If true, wrap list with blank lines
    var textarea = event.data.textarea;
    var firstline = textarea.selection.getLines()[0];
    if (firstline.startswith(prefix)) {
        textarea.selection.removeLinePrefixes(prefix);
        if (wrap) {
            textarea.selection.unwrapBlankLines();
        }
    } else {
        textarea.selection.addLinePrefixes(prefix);
        if (wrap) {
            textarea.selection.wrapBlankLines();
        }
    }
    textarea.update();
};

/*----------------------------------------------------------------------------------------------
 * Wysiwym AutoIndent
 * Handles auto-indentation when enter is pressed
 *--------------------------------------------------------------------------------------------- */
cb.autoIndent = function(event) {
    // Only continue if keyCode == 13
    if (event.keyCode != 13)
        return true;
    // ReturnKey pressed, lets indent!
    //var markup = event.data.markup;    // Markup Language
    var textarea = event.data.textarea;
    var linenum = textarea.selection.start.line;
    var line = textarea.lines[linenum];
    var postcursor = line.substring(textarea.selection.start.position, line.length);
    // Make sure nothing is selected & there is no text after the cursor
    if ((textarea.selection.length() !== 0) || (postcursor))
        return true;
    // So far so good; check for a matching indent regex
    for (var i=0; i < markup.autoindents.length; i++) {
        var regex = markup.autoindents[i];
        var matches = line.match(regex);
        if (matches) {
            var prefix = matches[0];
            var suffix = line.substring(prefix.length, line.length);
            // NOTE: If a selection is made in the regex, it's assumed that the
            // matching text is a number should be auto-incremented (ie: #. lists).
            if (matches.length == 2) {
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
                textarea.lines[linenum] = BLANKLINE;
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
};

/*----------------------------------------------------------------------------------------------
 * Wysiwym handleShortcut
 * Handles keyboard shortcuts
 *--------------------------------------------------------------------------------------------- */
cb.handleShortcut = function(event) {
    
    // Check to see if we have a shortcut key and, if so click the according button.
    if ((event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey) {

        var buttons = event.data.markup.buttons;

        var keyCode = event.charCode || event.keyCode;
        var keyCodeStr = String.fromCharCode(keyCode).toLowerCase();

        buttons.forEach(function(button) {
            if (keyCodeStr === button.shortcutKey) {
                // If the shortcut key matches, prevent the default action
                // and click the button's jQuery element
                event.preventDefault();
                button.$el.click();
            }
        });
    }

};



/* ---------------------------------------------------------------------------
 * Wysiwym Markdown
 * Markdown markup language for the Wysiwym editor
 * Reference: http://daringfireball.net/projects/markdown/syntax
 *---------------------------------------------------------------------------- */
function Markdown() {
    console.log('this is markdown init');
    //this.$textarea = $(textelement);    // jQuery textarea object
    //console.log(this.$textarea);
    //console.log(textarea);
    //this.wysiwym = new Wysiwym(textelement);

    var cb = callbacks;

    // Initialize the Markdown Buttons
    this.buttons = [
        [

        new Button('Heading 1', {
            icon: 'h1',
            hidetext: true,
            key: 'h'
        }, cb.span, {
            prefix: '# ',
            suffix: '',
            text: 'Heading 1'
        }), new Button('Heading 2', {
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

    ];

    // Configure auto-indenting
    this.exitindentblankline = true;    // True to insert blank line when exiting auto-indent ;)
    this.autoindents = [                // Regex lookups for auto-indent
        /^\s*\*\s/,                     // Bullet list
        /^\s*(\d+)\.\s/,                // Number list (number selected for auto-increment)
        /^\s*\>\s/,                     // Quote list
        /^\s{4}\s*/                     // Code block
    ];

    // Syntax items to display in the help box
    this.help = [
        { label: 'Header', syntax: '## Header ##' },
        { label: 'Bold',   syntax: '**bold**' },
        { label: 'Italic', syntax: '_italics_' },
        { label: 'Link',   syntax: '[pk!](http://google.com)' },
        { label: 'Bullet List', syntax: '* list item' },
        { label: 'Number List', syntax: '1. list item' },
        { label: 'Blockquote', syntax: '&gt; quoted text' },
        { label: 'Large Code Block', syntax: '(Begin lines with 4 spaces)' },
        { label: 'Inline Code Block', syntax: '&lt;code&gt;inline code&lt;/code&gt;' }
    ];
}


/* ---------------------------------------------------------------------------
 * Wysiwym Mediawiki
 * Media Wiki markup language for the Wysiwym editor
 * Reference: http://www.mediawiki.org/wiki/Help:Formatting
 *---------------------------------------------------------------------------- */
// Wysiwym.Mediawiki = function(textarea) {
//     this.$textarea = textarea;    // jQuery textarea object

//     // Initialize the Markdown Buttons
//     this.buttons = [
//         new Button('Bold',   Wysiwym.span,  {prefix:"'''", suffix:"'''", text:'strong text'}),
//         new Button('Italic', Wysiwym.span,  {prefix:"''",  suffix:"''",  text:'italic text'}),
//         new Button('Link',   Wysiwym.span,  {prefix:'[http://example.com ',  suffix:']', text:'link text'}),
//         new Button('Bullet List', Wysiwym.list, {prefix:'* ', wrap:true}),
//         new Button('Number List', Wysiwym.list, {prefix:'# ', wrap:true}),
//         new Button('Quote',  Wysiwym.span,  {prefix:'<blockquote>', suffix:'</blockquote>', text:'quote text'}),
//         new Button('Code', Wysiwym.span,  {prefix:'<pre>', suffix:'</pre>', text:'code text'})
//     ];

//     // Configure auto-indenting
//     this.exitindentblankline = true;    // True to insert blank line when exiting auto-indent ;)
//     this.autoindents = [                // Regex lookups for auto-indent
//         /^\s*\*\s/,                     // Bullet list
//         /^\s*\#\s/                      // Number list
//     ];

//     // Syntax items to display in the help box
//     this.help = [
//         { label: 'Header', syntax: '== Header ==' },
//         { label: 'Bold',   syntax: "'''bold'''" },
//         { label: 'Italic', syntax: "''italics''" },
//         { label: 'Link',   syntax: '[http://google.com pk!]' },
//         { label: 'Bullet List', syntax: '* list item' },
//         { label: 'Number List', syntax: '# list item' },
//         { label: 'Blockquote', syntax: '&lt;blockquote&gt;quote&lt;/blockquote&gt;' },
//         { label: 'Large Code Block', syntax: '&lt;pre&gt;Code block&lt;/pre&gt;' }
//     ];
// };


/* ---------------------------------------------------------------------------
 * Wysiwym BBCode
 * BBCode markup language for the Wysiwym editor
 * Reference: http://labs.spaceshipnofuture.org/icky/help/formatting/
 *---------------------------------------------------------------------------- */
// Wysiwym.BBCode = function(textarea) {
//     this.$textarea = textarea;    // jQuery textarea object

//     // Initialize the Markdown Buttons
//     this.buttons = [
//         new Button('Bold',   Wysiwym.span,  {prefix:"[b]", suffix:"[/b]", text:'strong text'}),
//         new Button('Italic', Wysiwym.span,  {prefix:"[i]",  suffix:"[/i]",  text:'italic text'}),
//         new Button('Link',   Wysiwym.span,  {prefix:'[url="http://example.com"]',  suffix:'[/url]', text:'link text'}),
//         new Button('Quote',  Wysiwym.span,  {prefix:'[quote]',  suffix:'[/quote]', text:'quote text'}),
//         new Button('Code',   Wysiwym.span,  {prefix:'[code]',  suffix:'[/code]', text:'code text'})
//     ];

//     // Syntax items to display in the help box
//     this.help = [
//         { label: 'Bold',   syntax: "[b]bold[/b]" },
//         { label: 'Italic', syntax: "[i]italics[/i]" },
//         { label: 'Link',   syntax: '[url="http://example.com"]pk![/url]' },
//         { label: 'Blockquote', syntax: '[quote]quote text[/quote]' },
//         { label: 'Large Code Block', syntax: '[code]code text[/code]' }
//     ];
// };


/*----------------------------------------------------------------------
 * Additional Javascript Prototypes
 *-------------------------------------------------------------------- */
String.prototype.strip = function() { return this.replace(/^\s+|\s+$/g, ''); };
String.prototype.lstrip = function() { return this.replace(/^\s+/, ''); };
String.prototype.rstrip = function() { return this.replace(/\s+$/, ''); };
String.prototype.startswith = function(str) { return this.substring(0, str.length) == str; };
String.prototype.endswith = function(str) { return this.substring(str.length, this.length) == str; };

//return Wysiwym;

});
