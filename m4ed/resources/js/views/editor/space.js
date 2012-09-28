// Filename: views/items/itemlist.js
define([
  'jquery',
  'underscore',
  'backbone',
  'collections/base',
  'views/editor/sortablelist',
  'views/editor/cluster',
  'views/editor/editor',
  'views/editor/upload',
  'jquery.ui.touch-punch'
],
function($, _, Backbone, BaseCollection, SortableListView, ClusterView, EditorView, UploadView) {

  var spaceView = SortableListView.extend({
    
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

      // "ItemView" here is ClusterView

      var el = options ? options.$el : undefined;

      var view = new ClusterView({
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

    }

  });
  return spaceView;
});