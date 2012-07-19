// Filename: views/items/list.js
define([
  'jquery',
  'underscore',
  'backbone',
  'collections/items',
  'views/items/show',
  'views/items/editor',
  'hogan'
],
function($, _, Backbone, ItemCollection, ItemView, EditorView, hogan) {

  var itemListView = Backbone.View.extend({

    events: {

    },
    
    initialize: function() {
      var self = this
        , parentView = this;

      this.collection = new ItemCollection();

      this.collection.on('add', function(item, collection, options) {
        var itemView = new ItemView({
          model: item,
          el: options.$el,
        });
        itemView.parent = parentView;
        //itemView.on('toggleEditor', self.onToggleEditor, self);
      });

      $('.item').each(function(index) {
        // Temporary ID so we can test the dummy api
        self.collection.add({id: $(this).data('id')}, {$el: $(this)});
      });

    }

  });
  return itemListView;
});