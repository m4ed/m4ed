// Filename: views/items/show.js
define([
  'underscore',
  'backbone',
  'models/items'

], function(_, Backbone, Item){
  var ItemView = Backbone.View.extend({

    model: Item,

    initialize: function(){
    },

    events: {
      "dblclick": "edit"
    },

    edit: function(e){
      this.trigger('edit');
    }

  });
  return ItemView;
});