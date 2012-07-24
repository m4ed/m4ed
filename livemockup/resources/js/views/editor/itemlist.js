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

      // Extend this object with all the custom options passed
      _.extend(this, options.custom);

      this.collection = new ItemCollection();
      var collection = this.collection;

      // Make a clone of BackBone.Events and use it as an event dispatcher
      // in all the child views
      this.dispatcher = _.clone(Backbone.Events);

      // Prepare the editor template for individual ItemViews
      this.editorTemplate = hogan.compile($('#editor-template').html());

      this.collection.bind('add', this.onAdd, this);

      $('.item').each(function(index) {
        // Temporary ID so we can test the dummy api
        var $this = $(this);
        collection.add({_id: $this.data('id')}, {$el: $this});
      });

    },

    onAdd: function(item, collection, options) {
      var itemView = new ItemView({
        model: item,
        el: options.$el,
        custom: {
          dispatcher: this.dispatcher,
          parent: this,
          editorTemplate: this.editorTemplate
        }
      });
    }

  });
  return itemListView;
});