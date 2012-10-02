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

  var TEXTAREA_MIN_HEIGHT = 200;

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

      //this.model.bind('change', this.onChange, this);
      this.model.bind('change:text', this.onTextChange, this);
      this.model.bind('destroy', this.onDestroy, this);

      this.dispatcher.on('insertAsset', this.onInsertAsset, this);
      this.dispatcher.on('textareaResized', this.onTextareaResize, this);
      this.dispatcher.on('textareaReady', this.onTextareaReady, this);

      if (!this.model.has('text')) {
        this.model.fetch();
      } else {
        if (!this.editorInitialized) this.editorInitialized = true;
        this.render().toggle();
      }

      return this;

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

      // init buttons
      var buttonGroups = templates.buttonGroups;
      this.$editorButtons = $el.find('.editor-buttons');
      for (var i in buttonGroups) {
        var group = buttonGroups[i];
        var buttonList = new ButtonListView({
          buttons: group.buttons,
          className: 'btn-group '+ group.className,
          custom: {
            dispatcher: this.dispatcher,
            parent: this,
            label: group.label,
            hideLabels: group.hideLabels
          }
        });
        this.$editorButtons.append(buttonList.render().el);
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
      $el.appendTo(this.parent.$el);

      return this;

    },

    events: {
      'keyup .editor-textarea': 'onTextareaKeyup',
      'drop .editor-textarea': 'onTextareaDrop',
      'click .editor-btn.pictures': 'onPictureButtonClick'
    },

    onDestroy: function(e) {
      if (this.$el.is(':visible')) {
        this.$el.slideUp();
        this.globalDispatcher.trigger('editorClosed');
      }
      this.close();
    },

    onClose: function(e) {
      this.dispatcher.trigger('closeButtons');
      // console.log('Editor closed.');
    },

    onTextChange: function(model, text, options) {
      //console.log('The model has changed!');
      if (!this.editorInitialized) {
        this.editorInitialized = true;
        // console.log('First time change!');
        this.render().toggle();
      } else {
        // "Enable" publish button on edit (no functionality yet)
        this.$('.publish button').removeClass('disabled');
        this.$('.publish button').addClass('btn-success');
      }
      this.generatePreview();
      
    },

    onTextareaResize: function (size) {
      if (!this.$preview) this.$preview = this.$('.preview');
      this.$preview.height(size.h - 8);
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

    onInsertAsset: function(markdown) {
      this.textarea.$el.insertAtCaret(markdown);
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

    updateDimensions: function() {

      var h = $(window).height();

      // console.log('Window height: ' + h);

      if (!this.$editorButtons) this.$editorButtons = this.$('.editor-buttons');
      if (!this.$textarea) this.$textarea = this.$('.editor-textarea');
      if (!this.$assetList) this.$assetList = this.$('.asset-container');
      if (!this.$assetToolbar) this.$assetToolbar = this.$('.asset-toolbar');
      if (!this.$prevEl) this.$prevEl = this.parent.$('.item');
      if (!this.$nextEl) this.$nextEl = this.parent.$el.next().children('.item');
      if (!this.$preview) this.$preview = this.$('.preview');

      var bodyPaddingTop = $('body').cssInt('paddingTop');

      var textareaVPad = this.$textarea.outerHeight(true) - this.$textarea.height();
      var editorVPad = this.$el.outerHeight(true) - this.$el.height();

      // console.log('*****************************************');
      // console.log('Editor buttons height: ' + this.$editorButtons.outerHeight(true));
      // console.log('Asset container height: ' + this.$assetList.outerHeight(true));
      // console.log('Asset buttons height: ' + this.$assetToolbar.outerHeight(true));
      // console.log('Prev elem height: ' + this.$prevEl.outerHeight(true));
      // console.log('Next elem height: ' + this.$nextEl.outerHeight(true));
      // console.log('Body pad top: ' + this.$nextEl.outerHeight(true));
      // console.log('Textarea vert pad: ' + textareaVPad);
      // console.log('Editor vert pad: ' + editorVPad);
      // console.log('*****************************************');

      var reduction = this.$editorButtons.outerHeight(true) +
          this.$assetList.outerHeight(true) +
          this.$assetToolbar.outerHeight(true) +
          this.$prevEl.outerHeight(true) + 
          textareaVPad +
          editorVPad +
          bodyPaddingTop;


      // Check if the next element exists
      if (this.$nextEl[0]) reduction += this.$nextEl.outerHeight(true);

      h -= reduction;

      if (h < TEXTAREA_MIN_HEIGHT) h = TEXTAREA_MIN_HEIGHT;

      // console.log('Textarea height: ' + h);  

      if (this.$textarea.height() !== h) this.$textarea.animate({
        'height': h
      }, 100, null, _.bind(function() {
        this.$textarea.resizable({
          alsoResize: this.$preview
        });
      }, this));

      if (this.$preview.height() !== h - 8) this.$preview.animate({
        'height': h - 8
      }, 100);

      // TODO: This is a bit buggy

      var winW = $(window).width();
      if (winW > 958) {
        var marginLeft = - ((winW - this.$el.prev().outerWidth()) / 2 + 20);
        this.$el.outerWidth(winW + 60);
        this.$el.css({'margin-left': marginLeft});
        this.$el.css({'padding': '8px 28px 0px 28px'});
        this.$el.outerWidth(winW); 
      }    

      return this;

    },

    toggle: function() {
      if (this.$el.is(':hidden')) {
        this.$el.slideDown(100, _.bind(function() {
          // if (!this.$textarea) this.$textarea = this.$('.editor-textarea');
          this.updateDimensions();
          this.parent.scrollTop();
        }, this));
        this.globalDispatcher.trigger('editorOpened');
      } else {
        this.$el.slideUp();
        this.globalDispatcher.trigger('editorClosed');
      }
    },

    onTextareaReady: function (e) {

      console.log('textarea ready');

      this.$textarea.resizable({
        alsoResize: this.$preview ? this.$preview : this.$('.preview')
      });

      
    },

    generatePreview: function() {
      // var mdContent = util.sanitizeHTML(this.model.get('text'));
      var mdContent = this.model.get('text');
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
    }


  });

  return EditorView;

});
