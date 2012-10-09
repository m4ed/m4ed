define(['jquery'], function($) {
    $.fn.extend({

      // Insert value at caret position
      // http://stackoverflow.com/a/3651124
      insertAtCaret: function(myValue){
      var obj;
      console.log(this);
      if( typeof this[0].name !='undefined' ) obj = this[0];
      else obj = this;

      if ($.browser.msie) {
        obj.focus();
        sel = document.selection.createRange();
        sel.text = myValue;
        obj.focus();
      }
      else if (obj.selectionStart !== undefined) {
        var startPos = obj.selectionStart;
        var endPos = obj.selectionEnd;
        // console.log(startPos, endPos);
        var scrollTop = obj.scrollTop;
        obj.value = obj.value.substring(0, startPos) + myValue + obj.value.substring(endPos,obj.value.length);
        obj.focus();
        obj.selectionStart = startPos + myValue.length;
        obj.selectionEnd = startPos + myValue.length;
        obj.scrollTop = scrollTop;
      } else {
        obj.value += myValue;
        obj.focus();
      }
    },

    // Get css value as an integer
    cssInt: function(property){
      var v = parseInt(this.css(property),10);
      return isNaN(v) ? 0 : v;
    },

    selectRange: function(start, end) {
      return this.each(function() {
        if (this.setSelectionRange) {
          this.focus();
          this.setSelectionRange(start, end);
        } else if (this.createTextRange) {
          var range = this.createTextRange();
          range.collapse(true);
          range.moveEnd('character', end);
          range.moveStart('character', start);
          range.select();
        }
      });
    }
  });

});
