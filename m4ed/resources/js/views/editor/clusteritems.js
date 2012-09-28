// Filename: views/items/itemlist.js
define([
  'jquery',
  'underscore',
  'backbone',
  'collections/base',
  'models/item',
  'views/editor/sortablelist',
  'views/editor/item',
  'views/editor/editor',
  'views/editor/upload',
  'jquery.ui.touch-punch'
],
function($, _, Backbone, BaseCollection, ItemModel, SortableListView, ItemView, EditorView, UploadView) {

  var clusterItemsView = SortableListView.extend({
    
    initialize: function(options) {

      // _.extend(options.custom, {
      //   collection: new BaseCollection({
      //     // url: this.model.url() + '/items',
      //     url: '/api/items',
      //     model: ItemModel
      //   })
      // });
      
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