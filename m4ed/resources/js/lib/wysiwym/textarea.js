define(['./selection'], function(Selection) {
  /*----------------------------------------------------------------------
   * Additional Javascript Prototypes
   *-------------------------------------------------------------------- */
  String.prototype.strip = function() { return this.replace(/^\s+|\s+$/g, ''); };
  String.prototype.lstrip = function() { return this.replace(/^\s+/, ''); };
  String.prototype.rstrip = function() { return this.replace(/\s+$/, ''); };
  String.prototype.startswith = function(str) { return this.slice(0, str.length) === str; };
  String.prototype.endswith = function(str) { return this.slice(str.length, this.length) === str; };
  /*----------------------------------------------------------------------------------------------
   * Wysiwym Textarea
   * This can used used for some or all of your textarea modifications. It will keep track of
   * the the current text and selection positions. The general idea is to keep track of the
   * textarea in terms of Line objects.  A line object contains a lineType and supporting text.
   *--------------------------------------------------------------------------------------------- */
  var WysiwymTextarea = function(el) {
    this.init(el);
  };

  WysiwymTextarea.prototype = {

    init: function(el) {
      this.el = el;                                 // Javascript textarea element
      this.$el = $(el);                             // jQuery textarea object
      this.lines = [];                              // Current textarea lines
      this.selection = new Selection();             // Selection properties & manipulation
      this.scroll = this.el.scrollTop;              // Current cursor scroll position
      this.blankline = '';
    },

    refreshedSelection: function() {
      this.selection.refresh(
          this.getText(), this.getSelectionStartEnd()
        );
      this.lines = this.selection.lines;

      return this.selection;
    },

    getText: function() {
      return this.el.value.replace(/\r\n/g, '\n');
    },

    // Return a string representation of this object.
    toString: function() {
      var str = 'TEXTAREA: #'+ this.$el.attr('id') +'\n';
      str += this.selection.toString();
      str += 'SCROLL: '+ this.scroll +'px\n';
      str += '---\n';
      for (var i=0; i<this.lines.length; i++)
        str += 'LINE '+ i +': '+ this.lines[i] +'\n';
      return str;
    },

    // Return the current text value of this textarea object
    getProperties: function() {
      var newtext = []            // New textarea value
        , textLength = 0
        , selectionStart = 0      // Absolute cursor start position
        , selectionEnd = 0;       // Absolute cursor end position
      for (var i = 0, j = this.lines.length; i < j; i++) {
        if (i === this.selection.start.line)
          selectionStart = textLength + this.selection.start.position;
        if (i === this.selection.end.line)
          selectionEnd = textLength + this.selection.end.position;
        newtext.push(this.lines[i]);
        textLength += this.lines[i].length;
        if (i !== this.lines.length - 1) {
          newtext.push('\n');
          textLength += 1;
        }
      }
      return [newtext.join(''), selectionStart, selectionEnd];
    },

    // Return the absolute start and end selection postions
    // StackOverflow #1: http://goo.gl/2vSnF
    // StackOverflow #2: http://goo.gl/KHm0d
    getSelectionStartEnd: function() {

      var startpos, endpos;
      if (typeof(this.el.selectionStart) === 'number') {
        startpos = this.el.selectionStart;
        endpos = this.el.selectionEnd;
      } else {
        this.el.focus();
        var text = this.getText();
        var textlen = text.length;
        var range = document.selection.createRange();
        var textrange = this.el.createTextRange();
        textrange.moveToBookmark(range.getBookmark());
        var endrange = this.el.createTextRange();
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
      return [startpos, endpos];
    },

    // Update the textarea with the current lines and cursor settings
    update: function() {
      var properties = this.getProperties();
      var newtext = properties[0];
      var selectionStart = properties[1];
      var selectionEnd = properties[2];
      this.$el.val(newtext);
      if (this.el.setSelectionRange) {
          this.el.setSelectionRange(selectionStart, selectionEnd);
      } else if (this.el.createTextRange) {
          var range = this.el.createTextRange();
          range.collapse(true);
          range.moveStart('character', selectionStart);
          range.moveEnd('character', selectionEnd - selectionStart);
          range.select();
      }
      this.el.scrollTop = this.scroll;
      this.$el.focus();
    }
  };

  return WysiwymTextarea;

});
