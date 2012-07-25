define(['./selection'], function(Selection) {


/*----------------------------------------------------------------------------------------------
 * Wysiwym Textarea
 * This can used used for some or all of your textarea modifications. It will keep track of
 * the the current text and selection positions. The general idea is to keep track of the
 * textarea in terms of Line objects.  A line object contains a lineType and supporting text.
 *--------------------------------------------------------------------------------------------- */
var textarea = function(el) {
  this.init(el);
};

textarea.prototype = {

  init: function(el) {
    this.el = el;                                 // Javascript textarea element
    this.$el = $(el);                             // jQuery textarea object
    this.lines = [];                              // Current textarea lines
    this.selection = new Selection();             // Selection properties & manipulation
    this.scroll = this.el.scrollTop;              // Current cursor scroll position
  },

  refreshedSelection: function() {
    console.log(this.getText());
    console.log(this.getSelectionStartEnd());
    this.lines = this.selection.refresh(this.getText(), this.getSelectionStartEnd());
    console.log(this.lines);
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
    var lines = this.lines
      , newtext = []            // New textarea value
      , textLength = 0
      , selectionStart = 0            // Absolute cursor start position
      , selectionEnd = 0              // Absolute cursor end position
      , start = this.selection.start  // Selection object's start attribute
      , end = this.selection.end;     // Selection object's end attribute
    //console.log('There are ' + this.lines.length + ' lines');

    for (var i in lines) {
      if (i === start.line) {
        selectionStart = textLength + start.position;
      }
      if (i === end.line) {
        selectionEnd = textLength + end.position;
      }

      newtext.push(lines[i]);
      textLength += lines[i].length;

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
      var text = this.getText()
        , textlen = text.length
        , range = document.selection.createRange()
        , textrange = this.el.createTextRange();
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
    var properties = this.getProperties()
      , newtext = properties[0]
      , selectionStart = properties[1]
      , selectionEnd = properties[2];

    console.log(properties);

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

Button.prototype = {
  // Return the CSS Class for this button
  getCssClass: function() {
    return this.cssclass ? this.cssclass : this.name.toLowerCase().replace(' ', '');
  },

  // Create and return a new Button jQuery element
  init: function(textarea, buttons) {
    this.textarea = textarea;
    // var $text = $('<span class="text">'+ this.name +'</span>');
    // var $i = $('<i class="icon-'+ this.icon +'"></i>');
    // var $wrap = $('<span class="wrap"></span>').append($text);
    //if (this.hidetext) $text.hide();
    //if (this.icon !== undefined) $wrap.append($i);
    //var $button = $('<div class="button btn"></div>').append($wrap);
    // Add bootstrap tooltip
    // $button.tooltip({
    //   title: this.tooltip,
    //   delay: {
    //     show: 1500,
    //     hide: 200
    //   }
    // });

    var attrs = {
      name: this.name,
      icon: this.icon,
      display: 'none',
      tooltip: this.tooltip,
      buttonclass: this.getCssClass()
    }

    // $button.addClass(this.getCssClass());
    // // Make everything 'unselectable' so IE doesn't freak out
    // $text.attr('unselectable', 'on');
    // $wrap.attr('unselectable', 'on');
    // $button.attr('unselectable', 'on');
    // Attach jQuery element so we can access it easily
    //this.$el = $button;

    //var battoni = hogan.compile($('#wysiwym-button-template').html());
    return {
      buttonwrap: function() {
        return function(text) {
          //console.log(text);
          var el = hogan.compile(text).render(attrs);
          var $el = $(el);
          var options = {
            title: attrs.tooltip,//this.tooltip,
            delay: {
              show: 1500,
              hide: 200
            }
          };
          $el.data('tooltip', (data = $el.tooltip(options)));
          $el.data('click', (data = $el.click(function(){alert('hi')})));

          return el;
        }
      }
    }
  }
};

return textarea;

});
