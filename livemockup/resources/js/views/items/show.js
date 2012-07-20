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
      this.model.bind('change:title', this.onTitleChange, this);
      this.editing = false;
      this.editor = null;
    },

    events: {
      "click .view": "onTitleClick",
      "click .item-content": "onContentClick",
      "blur .edit": "onBlur"
    },

    onTitleClick: function(e) {
      e.stopPropagation();
      //e.currentTarget()
      var $target = $(e.currentTarget);
      if (!this.$input) {
        this.$view = $target;
        this.$input = $target.siblings('input');
        this.$title = $target.parent('h4');
      }
      this.$title.addClass('editing');
      this.$input.focus();
      //console.log('Editing!');
    },

    onBlur: function(e) {
      var title = this.$input.val();
      this.model.set('title', title);
      this.$view.html(title);
      this.$title.removeClass('editing');
    },

    setEditorText: function(text) {
      this.editor.setEditorText(text);
    },

    onTitleChange: function(model) {
      this.$view.html(this.$input.val());
    },

    onContentClick: function(e) {
      var self = this;

      e.stopPropagation();
      //this.clearSelection();

      // Check if we need a new editor view created
      if (this.editor === null) {
        //console.log(this.model);
        this.editor = new EditorView({model: this.model, eventDispatcher: this.eventDispatcher});
        this.editor.parent = this;
        //this.editor.eventDispatcher = this.eventDispatcher;
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