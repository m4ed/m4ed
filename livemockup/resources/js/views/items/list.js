// Filename: views/items/list.js
define([
  'jquery',
  'underscore',
  'backbone',
  'collections/items',
  'views/items/show'

], function($, _, Backbone, ItemCollection, ItemView){

  var ItemListView = Backbone.View.extend({
    el: '.container',
    initialize: function(){

      this.collection = new ItemCollection();
      this.collection.on('add', function(item, collection, options) {
        console.log(options.$el, options.index);
        new ItemView({model: item, el: options.$el})
      });

      var self = this;

      $('.item').each(function(index) {
        self.collection.add({}, {$el: $(this)});
      });

      console.log('ItemListView initialized.')

    }

  });
  return ItemListView;
});