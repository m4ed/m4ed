// https://github.com/alwex/jquery.post.message

define(['jquery'], function($) {
  $.fn.extend({
    // post message from a domain to another
    postMessage: function(message) {
      var toUrl = this.attr("src");
      var iframe = document.getElementById(this.attr("id")).contentWindow;
      if (window.postMessage) {
        // standard HTML5 support
        iframe.postMessage(message, toUrl);
      } else {
        // IE < 8 specific support
        var theIframe = document.getElementById(this.attr("id"));
        theIframe.src = theIframe.src.split('#')[0] + "#" + message;
      }
    },
    // read message from a domain
    onMessage: function(triggeredFunction) {
      if (window.postMessage) {
        // standard HTML5 support
        if (typeof window.addEventListener != 'undefined') {
          window.addEventListener('message', triggeredFunction, false);
        } else if (typeof window.attachEvent != 'undefined') {
          window.attachEvent('onmessage', triggeredFunction);
        }
      } else {
        // IE < 8 specific support
        var _origURL = document.location.href;
        var _poller = function() {
          if (document.location.href != _origURL) {
            _origURL = document.location.href;
            var currentUrl = document.location.href;
            
            var message = currentUrl.split('#')[1];
            document.location.hash="";

            var event = {
              data : ""
            };
            
            event.data = message;

            triggeredFunction(event);
          }
        };
        setInterval(_poller, 300);
      }
    }
  });
});