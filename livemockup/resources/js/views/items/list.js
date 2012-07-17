// Filename: views/items/list.js
define([
  'jquery',
  'underscore',
  'backbone',
  'collections/items',
  'views/items/show',
  'views/items/editor'
],
function($, _, Backbone, ItemCollection, ItemView, EditorView){

  var ItemListView = Backbone.View.extend({

    el: '.container',

    events: {

    },
    
    initialize: function() {
      var self = this
        , parentView = this;

      this.editor = new EditorView({el: this.$('#editor')});
      this.editor.parent = this;

      this.collection = new ItemCollection();

      this.collection.on('add', function(item, collection, options) {
        var itemView = new ItemView({
          model: item,
          el: options.$el,
        });
        itemView.parent = parentView;
      });



      $('.item').each(function(index) {
        self.collection.add({/* Empty */}, {$el: $(this)});
      });

    }

  });
  return ItemListView;
});