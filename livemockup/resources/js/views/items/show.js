// Filename: views/items/show.js
define([
  'underscore',
  'backbone',
  'models/items',
  'views/items/editor'
],
function(_, Backbone, Item, EditorView) {
  var keyCodes = {
    27: 'esc',
    13: 'enter'
  }

  var itemView = Backbone.View.extend({

    initialize: function(options) {
      // Extend this object with all the custom options passed
      _.extend(this, options.custom);
      this.model.bind('change:title', this.onTitleChange, this);
      this.editing = false;
      this.editor = null;

      var $el = $(options.el);
      this.$titleSpan = $el.find('.title >.view');
      this.$titleInput = $el.find('.title > input.edit');
      this.$title = $el.find('.title');
    },

    events: {
      "click .view": "onTitleClick",
      "click .edit": "onEditClick",
      "click .item-content": "onContentClick",
      "blur .edit": "onEditBlur",
      "keyup .edit": "onEditKeyup"
    },

    onTitleClick: function(e) {
      e.stopPropagation();
      if (!this.model.has('title')) {
        this.model.fetch();
      }
      // Check if the input element has been saved previously.
      // If not, assume that other variables need to be saved too.
      this.$title.addClass('editing');
      this.$titleInput.focus();
      //console.log('Editing!');
    },

    onEditClick: function(e) {
      e.stopPropagation();
      return false;
    },

    onContentClick: function(e) {
      var self = this;

      e.stopPropagation();
      //this.clearSelection();

      // Check if we need a new editor view created
      if (this.editor === null) {
        console.log('Editor on line');
        this.editor = new EditorView({
          model: this.model,
          custom: {
            eventDispatcher: this.eventDispatcher,
            parent: this
          }
        });
      } else {
        this.editor.toggle();
      }

      return false;
    },

    onEditBlur: function(e) {
      this.closeEdit(false);
    },

    onEditKeyup: function(e) {
      // If the key is enter
      //console.log(e.which);
      var key = keyCodes[e.which]
        , saveResult = false;
      switch(key) {
      case 'enter':
        saveResult = true;
      case 'esc':
        this.closeEdit(saveResult);
        break;
      }
    },

    onTitleChange: function(model) {
      this.$titleSpan.html(this.model.get('title'));
    },

    closeEdit: function(save) {
      if (save) {
        var title = this.$titleInput.val();
        this.model.set('title', title);
        this.$titleSpan.html(title);
      } else {
        this.$titleInput.val(this.model.get('title'));
      }
      this.$title.removeClass('editing');
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