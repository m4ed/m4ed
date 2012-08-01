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
      "sortupdate": "onSortUpdate"
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
        collection.add({_id: $this.data('id')}, {$el: $this, listIndex: index});
      });

      this.$list = this.$el.find('.ui-sortable');

      // Make the list sortable
      this.$list.sortable({
        distance: 20
      });

      // Track the number of open editors and disable sorting while > 0
      this.editorsOpen = 0;
      this.globalDispatcher.on('editorOpened', this.onEditorOpened, this);
      this.globalDispatcher.on('editorClosed', this.onEditorClosed, this);  

    },

    onAdd: function(item, collection, options) {
      var itemView = new ItemView({
        model: item,
        el: options.$el,
        listIndex: options.listIndex,
        custom: {
          dispatcher: _.clone(Backbone.Events),
          globalDispatcher: this.globalDispatcher,
          parent: this,
          templates: this.templates
        }
      });
    },

    onSortUpdate: function(e, ui) {
      var order = this.$list.sortable('toArray');
      this.globalDispatcher.trigger('sortUpdated', order);
    },

    onEditorOpened: function() {
      if (this.editorsOpen === 0) {
        this.$list.sortable('disable');
      }
      this.editorsOpen++;
    },

    onEditorClosed: function() {
      this.editorsOpen--;
      if (this.editorsOpen === 0) {
        this.$list.sortable('enable');
      }
    }

  });
  return itemListView;
});