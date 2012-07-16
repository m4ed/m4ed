// Filename: views/items/show.js
define([
  'jquery',
  'underscore',
  'backbone',
  'models/items'

], function($, _, Backbone, Item){
  var ItemView = Backbone.View.extend({

    initialize: function(){
      this.model = Item;
      console.log('ItemView initialized.')
    },

    events: {
      "dblclick": "edit"
    },

    edit: function(e) {
      e.preventDefault()
      alert('Item opened!')
    }

  });
  return ItemView;
});