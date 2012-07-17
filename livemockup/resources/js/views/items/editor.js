// Filename: views/items/editor.js
define([
  'jquery',
  'underscore',
  'backbone',
  'wysiwym',
  'hogan',
  'jquery.ui',
  'jquery.plugins'
],
function($, _, Backbone, wysiwym, hogan) {
  var EditorView = Backbone.View.extend({

    className: 'editor well',

    initialize: function(options) {
      //var $el = options.el
      //  , self = this;

      this.template = hogan.compile($('#editor-template').html());
      // Reference to the current element the editor is attached to
      this.$attachedTo = null;
      this.activeXhr = null;
      this.lastContent = null;


    },

    render: function(model) {
      // Render with placeholder data
      this.$el.html(this.template.render(model.toJSON()));
      var $el = this.$el;

      $preview = $el.find('.preview:first');
      $textarea = $el.find('.editor-textarea:first');
      $pictureContainer = $el.find('.picture-container:first');
      $editorButtons = $el.find('.editor-buttons:first');

      // init wysiwym.js
      $textarea.wysiwym(Wysiwym.Markdown, {containerButtons: $editorButtons});

      // Make the Textarea prettier with jQueryUI
      $('img', $pictureContainer).draggable({
        revert: "invalid", // when not dropped, the item will revert back to its initial position
        containment: this.el ? this.el : "document", // stick to editor (el) if present
        helper: "clone",
        cursor: "move"
      });

      // let the textarea be droppable, accepting the pictures
      $textarea.droppable({
        accept: ".picture-container > img",
        activeClass: "ui-state-highlight",
        drop: function(event, ui) {
          $textarea.insertAtCaret('Picture added.');
        }
      });

      return this;
    },

    events: {
      'keyup .editor-textarea': 'onTextareaKeyup',
      'click .editor-btn.pictures': 'onPictureButtonClick'
    },

    onTextareaKeyup: _.throttle(function(e) {
      e.stopPropagation();
      this.generatePreview();
    }, 1000),

    onPictureButtonClick: function(e) {
      e.stopPropagation();
      $arrow = this.$('#pointing-arrow');
      
      $arrow.slideToggle();
      this.$('.picture-container').slideToggle();
    },

    attachTo: function($target) {
      // Save this to self to avoid it being lost in callbacks 
      var self = this
        , $editor = this.$el;

      // Check if editor is not attached to current item
      if (!$target.hasClass('editing')) {
        // Check that we're actually attached to something
        // before trying to remove the editing class
        if (self.$attachedTo) {
          // Remove the old editing class from the element we are 
          // currently attached to
          self.$attachedTo.removeClass('editing');
        }
        // Attach the editing class to the new element
        // and assign the new target
        self.$attachedTo = $target;
        self.$attachedTo.addClass('editing');

        // Check if editor is hidden
        if ($editor.is(':visible')) {
          // Hide editor, move it to selected item and show it
          $editor.toggle('blind', function() {
            $editor.insertAfter($target);
            $editor.toggle('blind');
          });
          return false;
        }
      }
      $editor.insertAfter($target);
      // Show / hide editor 
      $editor.toggle('blind');
      return false;
    },

    setEditorText: function(text) {
      this.$('.editor-textarea').val(text);
    },

    getEditorText: function() {
      return this.$('.editor-textarea').val();
    },

    setPreviewHTML: function(text) {
      this.$('.preview').html(text);
    },

    toggle: function() {
      this.$el.toggle('blind')
    },

    generatePreview: function() {
      var self = this
        , mdContent = this.getEditorText();
      if (this.activeXhr || this.lastContent == mdContent) {
        return;
      }
      this.lastContent = mdContent;
      this.activeXhr = $.ajax({
        'url': '/misaka',
        'data': {'md': mdContent},
        'type': 'POST',
        'error': function(xhr) {
          self.$preview.html(xhr.html);
        },
        'success': function(response) {
          self.setPreviewHTML(response.html);
          self.activeXhr = null;
        }
      });
    }


  });

  return EditorView;

});