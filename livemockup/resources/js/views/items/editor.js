// Filename: views/items/editor.js
define([
  'jquery',
  'underscore',
  'backbone',
  'views/bottombar',
  'wysiwym',
  'hogan',
  'jquery.ui',
  'jquery.plugins'
],
function($, _, Backbone, BottomBar, wysiwym, hogan) {
  var EditorView = Backbone.View.extend({

    tagName: 'div',

    // These class names will be used for the element
    className: 'well editor',

    // The attributes for the div
    attributes: {
      'style': 'display:none;'
    },

    initialize: function(options) {
      this.template = hogan.compile($('#editor-template').html());
      this.activeXhr = null;
      this.lastContent = null;
    },

    render: function(model) {
      var $el = this.$el;
      // Render the template with the model data
      $el.html(this.template.render(model.toJSON()));

      // Initiate a new bottom bar view
      this.bottomBar = new BottomBar({el: $el.find('.picture-container')});
      this.bottomBar.parent = this;

      // Decorate the rendered elements with various libraries
      $preview = $el.find('.preview:first');
      $textarea = $el.find('.editor-textarea:first');
      $pictureContainer = $el.find('.picture-container:first');
      $editorButtons = $el.find('.editor-buttons:first');

      // init wysiwym.js
      $textarea.wysiwym(Wysiwym.Markdown, {containerButtons: $editorButtons});

      // let the textarea be droppable, accepting the pictures
      $textarea.droppable({
        accept: ".picture-container > img",
        activeClass: "ui-state-highlight",
        drop: function(event, ui) {
          $textarea.insertAtCaret('Picture added.');
        }
      });

      // Stupid work around 
      this.$el.insertAfter(this.parent.$el);



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

    setEditorText: function(text) {
      this.$('.editor-textarea').val(text);
    },

    getEditorText: function() {
      return this.$('.editor-textarea').val();
    },

    setPreviewHTML: function(html) {
      this.$('.preview').html(html);
    },

    toggle: function() {
      this.$el.toggle('slidetoggle')
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
        error: function(jqXHR, textStatus, errorThrown) {
          self.setPreviewHTML(errorThrown);
        },
        success: function(data, textStatus, jqXHR) {
          self.setPreviewHTML(data.html);
        },
        complete: function(jqHXR, textStatus) {
          self.activeXhr = null;
        }
      });
    },

    updateImages: function() {
      this.bottomBar.render();
    }


  });

  return EditorView;

});