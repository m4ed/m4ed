// Filename: lib/backbone/backbone.js
define(['lib/backbone/backbone.full'], function(){
  // .js?0.9.2

  Backbone.View.prototype.close = function(){
    // Unbind dispatchers
    if (this.dispatcher) this.dispatcher.off(null, null, this);
    if (this.globalDispatcher) this.globalDispatcher.off(null, null, this);
    // Unbind events
    this.unbind();

    if (this.onClose){
      this.onClose();
    }

    // Remove element
    this.remove(); 
  };

  // Override for wrapError to parse JSON data from the response

  // Wrap an optional error callback with a fallback error event.
  Backbone.wrapError = function(onError, originalModel, options) {
    return function(model, resp) {

      resp = model === originalModel ? resp : model;

      if (resp.responseText !== undefined) {
        if (resp.getResponseHeader('Content-Type').indexOf("json") !=-1) {
          resp.toJSON = function () {
            return JSON.parse(resp.responseText);
          };
        } 
      }

      if (onError) {
        onError(originalModel, resp, options);
      } else {
        originalModel.trigger('error', originalModel, resp, options);
      }
    };
  };

  return Backbone;

});