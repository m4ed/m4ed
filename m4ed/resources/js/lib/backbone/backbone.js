// Filename: lib/backbone/backbone.js
define(['lib/backbone/backbone.min'], function(){
  // .js?0.9.2

  Backbone.View.prototype.close = function(){
    if (this.onClose){
      this.onClose();
    }    
    this.remove();
    this.unbind();
  };
  
  return Backbone;
});