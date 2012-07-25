// Filename: views/items/show.js
define([
  'underscore',
  'backbone',
  'views/editor/editor'
],
function(_, Backbone, EditorView) {

  // key codes for keyup event
  var keyCodes = {
    27: 'esc',
    13: 'enter'
  };

  var itemView = Backbone.View.extend({

    initialize: function(options) {
      // Extend this object with all the custom options passed
      _.extend(this, options.custom);

      // Listen to changes in title and description
      this.model.bind('change:title', this.onTitleChange, this);
      this.model.bind('change:description', this.onDescriptionChange, this);

      this.editor = null;
      this.editorInitialized = false;

      var $el = $(options.el)
        , $title = $el.find('.title')
        , $description = $el.find('.desc');

      this.$title = $title;
      this.$titleSpan = $title.children('.view');
      this.$titleInput = $title.children('input.edit');

      this.$description = $description;
      this.$descriptionSpan = $description.children('.view');
      this.$descriptionInput = $description.children('.edit');
    },

    events: {
      "click .title > .view": "onTitleClick",
      "click .edit": "onEditClick",
      "click .desc > .view": "onDescriptionClick",
      "click .item-content": "onContentClick",
      "blur .edit": "onEditBlur",
      "keyup .edit": "onEditKeyup"
    },

    onTitleClick: function(e) {
      e.stopPropagation();
      if (!this.model.has('title')) {
        // Sync the model if it doesn't seem to have a title
        this.model.fetch();
      }
      this.$title.addClass('editing');
      this.$titleInput.select();
    },

    onDescriptionClick: function(e) {
      e.stopPropagation();
      if (!this.model.has('description')) {
        // Sync the model if it doesn't seem to have a description
        this.model.fetch();
      }
      this.$description.addClass('editing');
      this.$descriptionInput.select();
    },

    onEditClick: function(e) {
      // This prevents clicks going through the edit input area
      e.stopPropagation();
      return false;
    },

    onContentClick: function(e) {
      e.stopPropagation();

      // Check if we need a new editor view created
      if (this.editorInitialized === false) {
        this.editorInitialized = true;
        this.editor = new EditorView({
          model: this.model,
          custom: {
            globalDispatcher: this.globalDispatcher,
            dispatcher: this.dispatcher,
            parent: this,
            templates: this.templates
          }
        });
      } else {
        this.editor.toggle();
      }

      return false;
    },

    onEditBlur: function(e) {
      e.stopPropagation();
      // Don't save if the input loses focus
      this.closeEdit(false, e.currentTarget);
      return false;
    },

    onEditKeyup: function(e) {
      var saveResult = false;
      switch(keyCodes[e.which]) {
      case undefined:
        // The key wasn't found in keyCodes. Abort...
        return;
      case 'enter':
        saveResult = true;
        break;
      case 'esc':
        // Just break since saveResult is already false
        break;
      }
      this.closeEdit(saveResult, e.currentTarget);
    },

    onTitleChange: function(model, newTitle, options) {
      this.$titleSpan.text(newTitle);
      this.$titleInput.val(newTitle);
    },

    onDescriptionChange: function(model, newDescription, options) {
      this.$descriptionSpan.text(newDescription);
      this.$descriptionInput.val(newDescription);
    },

    closeEdit: function(save, target) {
      // target variable will always be an input element
      var $target = $(target)
        , attr = $target.data('attr');
      if (save) {
        this.model.set(attr, $target.val());
      } else {
        // Reset the input value if it wasn't saved
        $target.val(this.model.get(attr));
      }
      // Remove the editing class from the parent element to hide the input
      $target.parent().removeClass('editing');
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