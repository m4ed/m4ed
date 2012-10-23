// Filename: views/items/clusteritems.js
define([
  'jquery',
  'underscore',
  'backbone',
  'views/sortablelist',
  'views/item',
  'views/editor',
  'views/upload',
  'jquery.ui.touch-punch'
],
function($, _, Backbone, SortableListView, ItemView, EditorView, UploadView) {

  var clusterItemsView = SortableListView.extend({
    
    initialize: function(options) {
      
      SortableListView.prototype.initialize.apply(this, arguments);

      // Keep count of open editors
      this.editorsOpen = 0;

      // Bind global events
      this.globalDispatcher.on('editorOpened', this.onEditorOpened, this);
      this.globalDispatcher.on('editorClosed', this.onEditorClosed, this); 

      // Create a view for the modal upload form
      this.upload = new UploadView({
        el: '#fileupload',
        custom: {
          globalDispatcher: this.globalDispatcher
        }
      });

    },

    createItemView: function(model, options) {

      var el = options ? options.$el : undefined;

      var view = new ItemView({
        model: model,
        el: el,
        custom: {
          dispatcher: _.clone(Backbone.Events),
          globalDispatcher: this.globalDispatcher,
          templates: this.templates
        }
      });

      // Add the element to DOM in case it was not there already
      if (!el) {
        _.extend(options, {view: view});
        SortableListView.prototype.addItemToDOM.apply(this, arguments);
      }

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
  return clusterItemsView;
});