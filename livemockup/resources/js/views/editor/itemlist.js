// Filename: views/items/list.js
define([
  'jquery',
  'underscore',
  'backbone',
  'hogan',
  'collections/items',
  'views/editor/item',
  'views/editor/editor',
  'jquery.ui'
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
      this.globalDispatcher = _.clone(Backbone.Events);

      this.collection.bind('add', this.onAdd, this);

      $('.item').each(function(index) {
        // Temporary ID so we can test the dummy api
        var $this = $(this);
        collection.add({_id: $this.data('id')}, {$el: $this});
      });


      // TODO: editors must be somehow attached to their items,
      // otherwise this will not work
      // 
      this.$el.sortable({
        items: ".well.item"
      });

    },

    onAdd: function(item, collection, options) {
      var itemView = new ItemView({
        model: item,
        el: options.$el,
        custom: {
          dispatcher: _.clone(Backbone.Events),
          globalDispatcher: this.globalDispatcher,
          parent: this,
          templates: this.templates
        }
      });
    }

  });
  return itemListView;
});