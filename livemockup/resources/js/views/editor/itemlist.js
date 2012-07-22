// Filename: views/items/list.js
define([
  'jquery',
  'underscore',
  'backbone',
  'hogan',
  'collections/items',
  'views/editor/item',
  'views/editor/editor'
],
function($, _, Backbone, hogan, ItemCollection, ItemView, EditorView) {

  var itemListView = Backbone.View.extend({

    events: {

    },
    
    initialize: function(options) {
      var self = this
        , parentView = this;

      // Extend this object with all the custom options passed
      _.extend(this, options.custom);

      this.collection = new ItemCollection();

      // Make a clone of BackBone.Events and use it as an event dispatcher
      // in all the child views
      this.dispatcher = _.clone(Backbone.Events);

      // Prepare the editor template for individual ItemViews
      this.editorTemplate = hogan.compile($('#editor-template').html());

      this.collection.on('add', function(item, collection, options) {
        var itemView = new ItemView({
          model: item,
          el: options.$el,
          custom: {
            dispatcher: self.dispatcher,
            parent: parentView,
            editorTemplate: self.editorTemplate
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