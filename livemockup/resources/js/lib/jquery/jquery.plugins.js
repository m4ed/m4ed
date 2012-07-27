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
     },

    // Get css value as an integer
    cssValueAsInteger: function(property){
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




  // hoverIntent event from jQuery UI
  $.event.special.hoverintent = {
    setup: function() {
      $( this ).bind( "mouseover", jQuery.event.special.hoverintent.handler );
    },
    teardown: function() {
      $( this ).unbind( "mouseover", jQuery.event.special.hoverintent.handler );
    },
    handler: function( event ) {
      var self = this,
        args = arguments,
        target = $(event.target),
        cX, cY, pX, pY,

        cfg = {
          sensitivity: 7,
          interval: 150
        };
        
      function track( event ) {
        cX = event.pageX;
        cY = event.pageY;
      }
      pX = event.pageX;
      pY = event.pageY;
      function clear() {
        target
          .unbind( "mousemove", track )
          .unbind( "mouseout", arguments.callee );
        clearTimeout( timeout );
      }
      function handler() {
        if ( ( Math.abs( pX - cX ) + Math.abs( pY - cY ) ) < cfg.sensitivity ) {
          clear();
          event.type = "hoverintent";
          // prevent accessing the original event since the new event
          // is fired asynchronously and the old event is no longer
          // usable (#6028)
          event.originalEvent = {};
          jQuery.event.handle.apply( self, args );
        } else {
          pX = cX;
          pY = cY;
          timeout = setTimeout( handler, cfg.interval );
        }
      }
      var timeout = setTimeout( handler, cfg.interval );
      target.mousemove( track ).mouseout( clear );
      return true;
    }
  };


});
