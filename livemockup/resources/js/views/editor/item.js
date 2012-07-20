// Filename: views/items/show.js
define([
  'underscore',
  'backbone',
  'views/editor/editor'
],
function(_, Backbone, EditorView) {
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
      this.$titleSpan = $el.find('.title > .view');
      this.$titleInput = $el.find('.title > input.edit');
      this.$title = $el.find('.title');

      this.$descriptionSpan = $el.find('.desc > .view');
      this.$descriptionInput = $el.find('.desc > input.edit')
      this.$description = $el.find('.desc');
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
        // Sync the model just in case...
        this.model.fetch();
      }
      this.$title.addClass('editing');
      this.$titleInput.focus();
      //console.log('Editing!');
    },

    onDescriptionClick: function(e) {
      e.stopPropagation();
      if (!this.model.has('description')) {
        // Sync the model just in case...
        this.model.fetch();
      }
      this.$description.addClass('editing');
      this.$descriptionInput.focus();
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
      this.closeEdit(false, e.currentTarget);
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
        console.log(saveResult);
        this.closeEdit(saveResult, $(e.currentTarget).data('attr'));
        break;
      }
    },

    onTitleChange: function(model) {
      var title = this.model.get('title');
      this.$titleSpan.html(title);
      this.$titleInput.val(title);
    },

    closeTitleEdit: function(save, target) {
      $target = $(target);
      if (save) {
        var val = $target.val();
        // console.log(val);
        console.log($target.data('attr'))
        // console.log(this.model.attributes);
        this.model.set($target.data('attr'), val);
        $target.prev().html(val);
      } else {
        $target.val(this.model.get(target));
      }
      $target.parent().removeClass('editing');
    },

    closeEdit: function(save, target) {
      switch (target) {
      case 'description':
        if (save) {
          var val = this.$descriptionInput.val();
          this.model.set('description', val);
          this.$descriptionSpan.text(val);
        } else {
          this.$descriptionInput.val(this.model.get('description'));
        }
        this.$description.removeClass('editing');

      case 'title':
        if (save) {
          var val = this.$titleInput.val();
          this.model.set('title', val);
          this.$titleSpan.text(val);
        } else {
          this.$titleInput.val(this.model.get('title'));
        }
        this.$title.removeClass('editing');
      } 
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