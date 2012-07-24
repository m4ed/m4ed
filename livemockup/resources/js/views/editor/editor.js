// Filename: views/items/editor.js
define([
  'jquery',
  'underscore',
  'backbone',
  'views/editor/assetlist',
  'wysiwym',
  'jquery.ui',
  'jquery.plugins'
],
function($, _, Backbone, AssetListView, wysiwym) {
  var EditorView = Backbone.View.extend({

    tagName: 'div',

    // These class names will be used for the element
    className: 'well editor',

    // The attributes for the div
    attributes: {
      'style': 'display:none;'
    },

    initialize: function(options) {
      this.template = options.template;
      this.activeXhr = null;
      this.lastContent = null;
      this.editorInitialized = false;

      //this.model.bind('change', this.onChange, this);
      this.model.bind('change:text', this.onTextChange, this);

      // Extend this object with all the custom options passed
      _.extend(this, options.custom);

      // If the model already has text, assume it has been initialized
      // somewhere else and render it
      if (this.model.has('text')) {
        this.editorInitialized = true;
        console.log('Battle cruiser operational');
        this.render().toggle();
      } else {
        this.model.fetch();
      }
    },

    onTextChange: function(model, text, options) {
      //console.log('The model has changed!');
      if (!this.editorInitialized) {
        this.editorInitialized = true;
        console.log('First time change!');
        this.render().toggle();
      } 
      this.generatePreview();
    },

    render: function() {
      var self = this
        , $el = this.$el;
      // Render the template with the model data
      $el.html(this.template.render(this.model.toJSON()));

      // Initiate a new bottom bar view
      this.assetList = new AssetListView({
        el: $el.find('.asset-container'),
        custom: {
          dispatcher: this.dispatcher,
          parent: this
        }
      });

      this.assetList.on('insertImage', this.onInsertImage, this);

      // init wysiwym.js
      $el.find('.editor-textarea').wysiwym({
        $buttonContainer:  $el.find('.editor-buttons:first'),
        helpEnabled: true
      });

      // Stupid work around 
      $el.insertAfter(this.parent.$el);
      //this.generatePreview();
      //this.toggle();

      return this;
    },

    events: {
      'keyup .editor-textarea': 'onTextareaKeyup',
      'drop .editor-textarea': 'onTextareaDrop',
      'click .editor-btn.pictures': 'onPictureButtonClick'
    },

    onTextareaKeyup: _.throttle(function(e) {
      e.stopPropagation();
      this.update();
    }, 1000),

    onTextareaDrop: function(e) {
      var self = this;
      // Wait for the textarea to update itself with the dropped
      // text before trying to update any data
      setTimeout(function() {
        self.update();
      }, 10);
    },

    onPictureButtonClick: function(e) {
      e.stopPropagation();

      this.$('.asset-container').slideToggle();
    },

    onInsertImage: function(markdown) {
      this.$el.find('.editor-textarea').insertAtCaret(markdown);
      this.update();
    },

    update: function() {
      this.model.set('text', this.getEditorText());
      //this.model.change();
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
      if (this.$el.is(':hidden')) {
        var parent = this.parent;
        this.$el.slideDown(100, function() {
          // Scroll selected selected item to top
          $('html:not(:animated),body:not(:animated)').animate({
            scrollTop: parent.$el.offset().top - 8
          }, 200);
        });
      } else {
        this.$el.slideUp();
      }
    },

    generatePreview: function() {
      var self = this
        , mdContent = this.model.get('text'); //this.getEditorText();
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
        complete: function(jqXHR, textStatus) {
          self.activeXhr = null;
        }
      });
    },

    updateImages: function() {
      this.assetList.render();
    }


  });

  return EditorView;

});
