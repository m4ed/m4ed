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

  return Backbone;

});