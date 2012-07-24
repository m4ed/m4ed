define([], function() {
/*----------------------------------------------------------------------------------------------
 * Wysiwym Selection
 * Manipulate the textarea selection
 *--------------------------------------------------------------------------------------------- */
var selection = function(textarea) {
  this.init(textarea);
};

Selection.prototype = {

  init: function(textarea) {
    this.textarea = textarea;
    this.lines = textarea.lines;                 // Reference to textarea.lines
    this.start = { line:0, position:0 };        // Current cursor start positon
    this.end = { line:0, position:0 };          // Current cursor end position
  },

  refresh: function() {
    this.lines = [];
    var text = this.textarea.getText()
      , selectionInfo = this.textarea.getSelectionStartEnd()
      , selectionStart = selectionInfo[0]
      , selectionEnd = selectionInfo[1]
      , lines = this.lines;

    var endline = 0;
    while (endline >= 0) {
      endline = text.indexOf('\n');
      var line = text.slice(0, endline >= 0 ? endline : text.length);
      if ((selectionStart <= line.length) && (selectionEnd >= 0)) {
        if (selectionStart >= 0) {
          this.start.line = lines.length;
          this.start.position = selectionStart;
        }
        if (selectionEnd <= line.length) {
          this.end.line = lines.length;
          this.end.position = selectionEnd;
        }
      }
      lines[lines.length] = line;
      text = endline >= 0 ? text.slice(endline + 1, text.length) : '';
      selectionStart -= endline + 1;
      selectionEnd -= endline + 1;
    }
    // Tweak the selection end position if its on the edge
    if ((this.end.position === 0) && (this.end.line !== this.start.line)) {
      this.end.line -= 1;
      this.end.position = lines[this.end.line].length;
    }

    //console.log(lines);
    this.textarea.lines = lines;
    return this;
  },

  // Return a string representation of this object.
  toString: function() {
    var str = 'SELECTION: '+ this.length() +' chars\n';
    str += 'START LINE: '+ this.start.line +'; POSITION: '+ this.start.position +'\n';
    str += 'END LINE: '+ this.end.line +'; POSITION: '+ this.end.position +'\n';
    return str;
  },

  // Add a line prefix, reguardless if it's already set or not.
  addLinePrefixes: function(prefix) {
    for (var i=this.start.line; i <= this.end.line; i++) {
        this.lines[i] = prefix + this.lines[i];
    }
    this.start.position += prefix.length;
    this.end.position += prefix.length;
  },

  // Add the specified prefix to the selection
  addPrefix: function(prefix) {
    var numlines = this.lines.length;
    var line = this.lines[this.start.line];
    var newline = [
        line.slice(0, this.start.position),
        prefix,
        line.slice(this.start.position, line.length)
      ].join('');
    this.lines[this.start.line] = newline;
    this.start.position += prefix.length;

    if (this.start.line === this.end.line) {
      this.end.position += prefix.length;
    }
    // Check we need to update the scroll height;  This is very slightly
    // off because height !== scrollHeight. A fix would be nice.
    if (prefix.indexOf('\n') !== -1) {
      var scrollHeight = this.textarea.el.scrollHeight;
      var lineheight = parseInt(scrollHeight / numlines, 10);
      this.textarea.scroll += lineheight;
  }
},

  // Add the specified suffix to the selection
  addSuffix: function(suffix) {
    var line = this.lines[this.end.line];
    var newline = [
        line.slice(0, this.end.position),
        suffix,
        line.slice(this.end.position, line.length)
      ].join('');
    this.lines[this.end.line] = newline;
  },

  // Append the specified text to the selection
  append: function(text) {
    //console.log(this.lines);
    var line = this.lines[this.end.line];
    var newline = [
        line.slice(0, this.end.position),
        text,
        line.slice(this.end.position, line.length)
      ].join('');
    this.lines[this.end.line] = newline;
    this.end.position += text.length;
  },

  // Return an array of lines in the selection
  getLines: function() {
    var selectedlines = [];
    for (var i = this.start.line, j = this.end.line; i <= j; i++)
      selectedlines[selectedlines.length] = this.lines[i];
    return selectedlines;
  },

  // Return true if selected text contains has the specified prefix
  hasPrefix: function(prefix) {
    //console.log(this.lines);
    var line = this.lines[this.start.line];
    var start = this.start.position - prefix.length;
    if ((start < 0) || (line.slice(start, this.start.position) !== prefix))
      return false;
    return true;
  },

  // Return true if selected text contains has the specified suffix
  hasSuffix: function(suffix) {
    var line = this.lines[this.end.line];
    var end = this.end.position + suffix.length;
    if ((end > line.length) || (line.slice(this.end.position, end) !== suffix))
      return false;
    return true;
  },

  // Insert the line before the selection to the specified text. If force is
  // set to false and the line is already set, it will be left alone.
  insertPreviousLine: function(newline, force) {
    force = force !== undefined ? force : true;
    var prevnum = this.start.line - 1;
    if ((force) || ((prevnum >= 0) && (this.lines[prevnum] !== newline))) {
      this.lines.splice(this.start.line, 0, newline);
      this.start.line += 1;
      this.end.line += 1;
    }
  },

  // Insert the line after the selection to the specified text. If force is
  // set to false and the line is already set, it will be left alone.
  insertNextLine: function(newline, force) {
    force = force !== undefined ? force : true;
    var nextnum = this.end.line + 1;
    if ((force) || ((nextnum < this.lines.length) && (this.lines[nextnum] !== newline)))
        this.lines.splice(nextnum, 0, newline);
  },

  // Return true if selected text is wrapped with prefix & suffix
  isWrapped: function(prefix, suffix) {
    return ((this.hasPrefix(prefix)) && (this.hasSuffix(suffix)));
  },

  // Return the selection length
  length: function() {
    return this.val().length;
  },

  // Return true if all lines have the specified prefix. Optionally
  // specify prefix as a regular expression.
  linesHavePrefix: function(prefix) {
    for (var i=this.start.line; i <= this.end.line; i++) {
      var line = this.lines[i];
      if ((typeof(prefix) === 'string') && (!line.startswith(prefix))) {
        return false;
      } else if ((typeof(prefix) !== 'string') && (!line.match(prefix))) {
        return false;
      }
    }
    return true;
  },

  // Prepend the specified text to the selection
  prepend: function(text) {
    var line = this.lines[this.start.line];
    var newline = [
        line.slice(0, this.start.position),
        text,
        line.slice(this.start.position, line.length)
      ].join('');
    this.lines[this.start.line] = newline;
    // Update Class Variables
    if (this.start.line === this.end.line)
      this.end.position += text.length;
  },

  // Remove the prefix from each line in the selection. If the line
  // does not contain the specified prefix, it will be left alone.
  // Optionally specify prefix as a regular expression.
  removeLinePrefixes: function(prefix) {
    for (var i=this.start.line; i <= this.end.line; i++) {
      var line = this.lines[i];
      var match = prefix;
      // Check prefix is a regex
      if (typeof(prefix) !== 'string')
        match = line.match(prefix)[0];
      // Do the replace
      if (line.startswith(match)) {
        this.lines[i] = line.slice(match.length, line.length);
        if (i === this.start.line)
          this.start.position -= match.length;
        if (i === this.end.line)
          this.end.position -= match.length;
      }
    }
  },

  // Remove the previous line. If regex is specified, it will
  // only be removed if there is a match.
  removeNextLine: function(regex) {
    var nextnum = this.end.line + 1;
    var removeit = false;
    if ((nextnum < this.lines.length) && (regex) && (this.lines[nextnum].match(regex)))
      removeit = true;
    if ((nextnum < this.lines.length) && (!regex))
      removeit = true;
    if (removeit)
      this.lines.splice(nextnum, 1);
  },

  // Remove the specified prefix from the selection
  removePrefix: function(prefix) {
    if (this.hasPrefix(prefix)) {
      var line = this.lines[this.start.line];
      var start = this.start.position - prefix.length;
      var newline = [
          line.slice(0, start),
          line.slice(this.start.position, line.length)
        ].join('');
      this.lines[this.start.line] = newline;
      this.start.position -= prefix.length;
      if (this.start.line === this.end.line)
        this.end.position -= prefix.length;
    }
  },

  // Remove the previous line. If regex is specified, it will
  // only be removed if there is a match.
  removePreviousLine: function(regex) {
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
  },

  // Remove the specified suffix from the selection
  removeSuffix: function(suffix) {
    if (this.hasSuffix(suffix)) {
      var line = this.lines[this.end.line];
      var end = this.end.position + suffix.length;
      var newline = [
          line.slice(0, this.end.position),
          line.slice(end, line.length)
        ].join('');
      this.lines[this.end.line] = newline;
    }
  },

  // Set the prefix of each selected line. If the prefix is already and
  // set, the line willl be left alone.
  setLinePrefixes: function(prefix, increment) {
    increment = increment ? increment : false;
    for (var i=this.start.line; i <= this.end.line; i++) {
      if (!this.lines[i].startswith(prefix)) {
        // Check if prefix is incrementing
        if (increment) {
          var num = parseInt(prefix.match(/\d+/)[0], 10);
          prefix = prefix.replace(num, num+1);
        }
        // Add the prefix to the line
        var numspaces = this.lines[i].match(/^\s*/)[0].length;
        this.lines[i] = this.lines[i].lstrip();
        this.lines[i] = prefix + this.lines[i];
        if (i === this.start.line)
          this.start.position += prefix.length - numspaces;
        if (i === this.end.line)
          this.end.position += prefix.length - numspaces;
      }
    }
  },

  // Unwrap the selection prefix & suffix
  unwrap: function(prefix, suffix) {
    this.removePrefix(prefix);
    this.removeSuffix(suffix);
  },

  // Remove blank lines from before and after the selection.  If the
  // previous or next line is not blank, it will be left alone.
  unwrapBlankLines: function() {
    this.textarea.selection.removePreviousLine(/^\s*$/);
    this.textarea.selection.removeNextLine(/^\s*$/);
  },

  // Return the selection value
  val: function() {
    var value = '';
    for (var i=0; i < this.lines.length; i++) {
      var line = this.lines[i];
      if ((i === this.start.line) && (i === this.end.line)) {
        return line.slice(this.start.position, this.end.position);
      } else if (i === this.start.line) {
        value += line.slice(this.start.position, line.length) +'\n';
      } else if ((i > this.start.line) && (i < this.end.line)) {
        value += line +'\n';
      } else if (i === this.end.line) {
        value += line.slice(0, this.end.position);
      }
    }
    return value;
  },

  // Wrap the selection with the specified prefix & suffix
  wrap: function(prefix, suffix) {
    this.addPrefix(prefix);
    this.addSuffix(suffix);
  },

  // Wrap the selected lines with blank lines.  If there is already
  // a blank line in place, another one will not be added.
  wrapBlankLines: function() {
    if (this.textarea.selection.start.line > 0)
      this.textarea.selection.insertPreviousLine(this.blankline, false);
    if (this.textarea.selection.end.line < this.textarea.lines.length - 1)
      this.textarea.selection.insertNextLine(this.blankline, false);
  }
};

return selection;

});