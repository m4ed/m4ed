// Filename: views/items/list.js
define([
  'jquery',
  'underscore',
  'backbone',
  'collections/items',
  'views/editor/item',
  'views/editor/editor'
],
function($, _, Backbone, ItemCollection, ItemView, EditorView) {

  var itemListView = Backbone.View.extend({

    events: {

    },
    
    initialize: function(options) {
      var self = this
        , parentView = this;

      this.collection = new ItemCollection();

      // Make a clone of BackBone.Events and use it as an event dispatcher
      this.dispatcher = _.clone(Backbone.Events);

      // Extend this object with all the custom options passed
      _.extend(this, options.custom);

      this.collection.on('add', function(item, collection, options) {
        var itemView = new ItemView({
          model: item,
          el: options.$el,
          custom: {
            dispatcher: self.dispatcher,
            parent: parentView
          }
        });
        
        //itemView.on('toggleEditor', self.onToggleEditor, self);
      });

      $('.item').each(function(index) {
        // Temporary ID so we can test the dummy api
        self.collection.add({_id: $(this).data('id')}, {$el: $(this)});
      });

    }

  });
  return itemListView;
});