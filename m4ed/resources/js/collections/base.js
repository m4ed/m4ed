// Filename: collections/base.js
define([
  'underscore',
  'backbone',
  'models/base'
],
function(_, Backbone, BaseModel) {

  var baseCollection = Backbone.Collection.extend({
    model: BaseModel,
    initialize: function(options) { 
      if (options) {
        this.url = options.url;
        if (options.model) this.model = options.model;
      }
    }
  });

  return baseCollection;

});
