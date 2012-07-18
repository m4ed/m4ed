define(['jquery'], function($) {
    $.fn.extend({

      // Insert value at caret position
      // http://stackoverflow.com/a/3651124
      insertAtCaret: function(myValue){
      var obj;
      //console.log(this);
      if( typeof this[0].name !='undefined' ) obj = this[0];
      else obj = this;

      if ($.browser.msie) {
        obj.focus();
        sel = document.selection.createRange();
        sel.text = myValue;
        obj.focus();
      }
      else if ($.browser.mozilla || $.browser.webkit) {
        var startPos = obj.selectionStart;
        var endPos = obj.selectionEnd;
        var scrollTop = obj.scrollTop;
        obj.value = obj.value.substring(0, startPos)+myValue+obj.value.substring(endPos,obj.value.length);
        obj.focus();
        obj.selectionStart = startPos + myValue.length;
        obj.selectionEnd = startPos + myValue.length;
        obj.scrollTop = scrollTop;
      } else {
        obj.value += myValue;
        obj.focus();
       }
     }
    });

    // Get css value as an integer
    $.fn.extend({
      cssValueAsInteger: function(property){
        var v = parseInt(this.css(property), 10);
        return isNaN(v) ? 0 : v;
      }
    });
});
