// Filename: views/items/show.js
define([
  'underscore',
  'backbone',
  'models/items',
  'views/items/editor'
],
function(_, Backbone, Item, EditorView) {
  var ItemView = Backbone.View.extend({

    initialize: function(options) {
      //console.log('ItemView initialized.');
      //this.parent = options.parent;
      this.model.bind('change', this.onModelChange, this);
      this.editing = false;
      this.editor = null;
    },

    events: {
      // dblclick
      "click .editable.title": "onTitleClick",
      "click .item-content": "onContentClick"
      
      //"mousedown": "noselect"
    },

    onTitleClick: function(e) {
      e.stopPropagation();
      //e.currentTarget()
      console.log('Editing!');
    },

    setEditorText: function(text) {
      this.editor.setEditorText(text);
    },

    onModelChange: function(model) {
      if (model.hasChanged('text')) {
        this.setEditorText(model.get('text'))
      }
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
        this.editor = new EditorView();
        this.editor.parent = this;
        this.model.fetch({
          success: function(model, response) {
            self.editor.render(model);
            self.editor.toggle();
          },
          error: function(model, response) {
            alert(['Alerts suck! But we have to tell you that the AJAX request',
                   'just failed!'].join(' '));
            //self.setEditorText(response.html);
          }
        });
      } else {
        self.editor.toggle();
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
  return ItemView;
});