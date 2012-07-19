// Filename: views/items/show.js
define([
  'underscore',
  'backbone',
  'models/items',
  'views/items/editor'
],
function(_, Backbone, Item, EditorView) {
  var itemView = Backbone.View.extend({

    initialize: function(options) {
      //console.log('ItemView initialized.');
      //this.parent = options.parent;
      this.model.bind('change', this.onChange, this);
      this.editing = false;
      this.editor = null;
    },

    events: {
      "click .editable.title": "onTitleClick",
      "click .item-content": "onContentClick"
    },

    onTitleClick: function(e) {
      e.stopPropagation();
      //e.currentTarget()
      console.log('Editing!');
    },

    setEditorText: function(text) {
      this.editor.setEditorText(text);
    },

    onChange: function(model) {

      if (model.hasChanged('images')) {
        this.editor.updateImages();
      }
    },

    onContentClick: function(e) {
      var self = this;

      e.stopPropagation();
      //this.clearSelection();

      // Check if we need a new editor view created
      if (this.editor === null) {
        //console.log(this.model);
        this.editor = new EditorView({model: this.model});
        this.editor.parent = this;
      } else {
        this.editor.toggle();
      }

      return false;
    },

    clearSelection: function() {
      if (document.selection && document.selection.empty) {
          document.selection.empty();
      } else if (window.getSelection) {
          var sel = window.getSelection();
          sel.removeAllRanges();
      }
    }

  });
  return itemView;
});