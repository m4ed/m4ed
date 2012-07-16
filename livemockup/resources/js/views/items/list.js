// Filename: views/items/list.js
define([
  'jquery',
  'underscore',
  'backbone',
  'collections/items',
  'views/items/show'

], function($, _, Backbone, ItemCollection, ItemView, EditorView){

  var ItemListView = Backbone.View.extend({

    el: '.container',

    events: {

    },
    
    initialize: function(){

      this.editor = new EditorView();
      this.collection = new ItemCollection();
      var parentView = this;
      this.collection.on('add', function(item, collection, options) {
        console.log(options.$el, options.index);
        var item = new ItemView({el: options.$el, parent: parentView});
      });

      var self = this;

      $('.item').each(function(index) {
        self.collection.add({}, {$el: $(this)});
      });

    }

  });
  return ItemListView;
});