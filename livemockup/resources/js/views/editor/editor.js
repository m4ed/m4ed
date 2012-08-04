// Filename: views/items/editor.js
define([
  'jquery',
  'underscore',
  'backbone',
  'views/editor/assetlist',
  'views/editor/textarea',
  'views/editor/buttonlist',
  'views/editor/templates',
  'lib/util/util',
  'jquery.ui',
  'jquery.plugins'
],
function($, _, Backbone, AssetListView, TextareaView,  ButtonListView, templates, util) {
  var EditorView = Backbone.View.extend({

    tagName: 'div',

    // These class names will be used for the element
    className: 'well editor',

    // The attributes for the div
    attributes: {
      'style': 'display:none;'
    },

    initialize: function(options) {
      // Extend this object with all the custom options passed
      _.extend(this, options.custom);
      this.activeXhr = null;
      this.lastContent = null;
      this.editorInitialized = false;

      //this.model.bind('change', this.onChange, this);
      this.model.bind('change:text', this.onTextChange, this);


      // If the model already has text, assume it has been initialized
      // somewhere else and render it
      if (this.model.has('text')) {
        this.editorInitialized = true;
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
      var $el = this.$el;
      // Render the template with the model data

      $el.html(templates.editor.render(this.model.toJSON()));

      // Initiate a new asset list view
      this.assetList = new AssetListView({
        el: $el.find('.asset-container'),
        custom: {
          globalDispatcher: this.globalDispatcher,
          dispatcher: this.dispatcher,
          parent: this
        }
      });

      this.dispatcher.on('insertImage', this.onInsertImage, this);

      // init buttons
      var buttonGroups = templates.buttonGroups;
      for (var i in buttonGroups) {
        var buttons = new ButtonListView({
          //el: $el.find('.editor-buttons'),
          buttons: buttonGroups[i],
          custom: {
            dispatcher: this.dispatcher,
            parent: this
          }
        });

        $el.find('.editor-buttons').append(buttons.render().el);
      }


      this.textarea = new TextareaView({
        el: $el.find('.editor-textarea'),
        model: this.model,
        custom: {
          dispatcher: this.dispatcher,
          parent: this
        }
      });

      this.textarea.render();

      // Stupid work around 
      $el.insertAfter(this.parent.$el);

      return this;

    },

    events: {
      'keyup .editor-textarea': 'onTextareaKeyup',
      'drop .editor-textarea': 'onTextareaDrop',
      'click .editor-btn.pictures': 'onPictureButtonClick',
      'keyup': 'onKeyup'
    },

    onTextareaKeyup: _.throttle(function(e) {
      e.stopPropagation();
      this.update();
      return false;
    }, 1000),

    onTextareaDrop: function(e) {
      // Wait for the textarea to update itself with the dropped
      // text before trying to update any data
      var callback = _.bind(function() {
        this.update();
      }, this);
      setTimeout(callback, 10);
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
      this.model.save({'text': this.getEditorText()});
      //this.model.change();
    },

    setEditorText: function(text) {
      this.textarea.$el.val(text);
    },

    getEditorText: function() {
      return this.textarea.$el.val();
    },

    setPreviewHTML: function(html) {
      this.$('.preview').html(html);
    },

    toggle: function() {
      if (this.$el.is(':hidden')) {
        var item = this.parent;
        this.$el.slideDown(100, _.bind(item.scrollTop, item));
        this.globalDispatcher.trigger('editorOpened');
      } else {
        this.$el.slideUp();
        this.globalDispatcher.trigger('editorClosed');
      }
    },

    generatePreview: function() {
      var mdContent = util.sanitizeHTML(this.model.get('text')); //this.getEditorText();
      if (this.activeXhr || this.lastContent == mdContent) {
        return;
      }
      this.lastContent = mdContent;
      this.activeXhr = $.ajax({
        'url': '/misaka',
        'data': {'md': mdContent},
        'type': 'POST',
        error: _.bind(this.onAjaxError, this),
        success: _.bind(this.onAjaxSuccess, this),
        complete: _.bind(this.onAjaxComplete, this)
      });
    },

    onAjaxError: function(jqXHR, textStatus, errorThrown) {
      this.setPreviewHTML(errorThrown);
    },

    onAjaxSuccess: function(data, textStatus, jqXHR) {
      this.setPreviewHTML(data.html);
    },

    onAjaxComplete: function(jqXHR, textStatus) {
      this.activeXhr = null;
    },

    updateImages: function() {
      this.assetList.render();
    },

    onKeyup: function(e) {
      // Left arrow or right arrow
      if (e.keyCode === 37) {
        this.assetList.navigate('left');
      } else if (e.keyCode === 39) {
        this.assetList.navigate('right');
      }
      return false;
    }


  });

  return EditorView;

});
