// Filename: views/editor/item.js
define([
  'underscore',
  'backbone',
  'views/editor/listitem',
  'views/editor/editor'
],
function(_, Backbone, ListItemView, EditorView) {

  var itemView = ListItemView.extend({

    // initialize: function(options) {
    //   ListItemView.prototype.initialize.apply(this, arguments);
    // },

    onItemClick: function(e) {
      ListItemView.prototype.onItemClick.apply(this, arguments);

      // Check if we need a new editor view created
      if (!this.editor) {
        this.editor = new EditorView({
          model: this.model,
          custom: {
            globalDispatcher: this.globalDispatcher,
            dispatcher: this.dispatcher,
            parent: this
          }
        });
      } else {
        this.editor.toggle();
      }

      return false;

    },

    onTagsKeyupTab: function(e) {
      // This overrides the handler in ListItemView
      e.preventDefault();
      if (this.editor && this.editor.$el.is(':visible')) {
        this.editor.textarea.$el.focus();
      } else {
        this.$el.next().find('.title .view').click();
      }
    }

  });
  return itemView;
});