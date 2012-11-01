// Filename: views/items/editor.js
define([
  'jquery',
  'underscore',
  'backbone',
  'views/assetlist',
  'views/textarea',
  'views/buttonlist',
  'views/templates',
  'lib/util/util',
  'jquery.ui',
  'jquery.plugins',
  'jquery.postmessage'
],
function($, _, Backbone, AssetListView, TextareaView,  ButtonListView, templates, util) {

  var MIN_HEIGHT = 200;
  var MIN_WIDTH = 200;

  var BASE_MARGIN = 4;
  var BASE_DURATION = 100;
  var THROTTLE_LIMIT = 100;

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

      $(window).on('resize', _.bind(this.onWindowResize, this));

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
      
      var baseUrl = location.protocol + '//' + location.host;
      this.model.set({'preview_url': baseUrl + '/i/' + this.model.get('_id') + '/preview'});

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

      $el.appendTo(this.parent.$el);

      // Store elements
      this.$left = this.$('.left');
      this.$right = this.$('.right');
      this.$vHandle = this.$('.vertical-handle');
      this.$hHandle = this.$('.horizontal-handle');
      this.$editorButtons = this.$('.editor-buttons');
      this.$previewButtons = this.$('.preview-buttons');
      this.$preview = this.$('.preview');
      this.$textarea = this.$('.editor-textarea');
      this.$assetList = this.$('.asset-container');
      this.$assetToolbar = this.$('.asset-toolbar');
      this.$parentItem = this.parent.$('.item');

      this.initHandles();

      this.windowSize = { x: $(window).width(), y: $(window).height() };

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

    onTextareaKeyup: _.throttle(function(e) {
      e.stopPropagation();
      this.update();
      return false;
    }, THROTTLE_LIMIT * 10),

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

    updatePreview: function(html) {
      // Posting the new html to the iframe
      this.$('.preview').postMessage(html);
    },

    onWindowResize: function() {
      if (!this.$el.is(':hidden')) {
        var w = $(window).width()
          , h = $(window).height();
        if (this.windowSize.x !== w) {
          this.windowSize.x = w;
          this.updateWidth(0);
          this.updateHeight(null, 0);
        }        
      }
    },   

    initHandles: function() {
      this.$vHandle.draggable({
        iframeFix: true,
        axis: 'x',
        cursor: 'col-resize',
        containment: this.$el,

        drag: _.bind(function (e, ui) {

          var elWidth = this.$el.width();
          var ratio = ui.position.left / elWidth;
          if (ratio < 0.20) {
            ui.position.left = elWidth * 0.2;
          } else if (ratio > 0.80) {
            ui.position.left = elWidth * 0.8;
          }

          var leftW = ui.position.left + BASE_MARGIN;
          var rightW = elWidth - ui.position.left - BASE_MARGIN;          

          this.$left.css('width', leftW);
          this.$right.css('width', rightW);

 
        }, this),
        stop: _.bind(function (e, ui) {

          var elWidth = this.$el.width();
          // ratioLeft = ( handlePosition + handleWidth / 2 ) / elWidth 
          var ratioLeft = ( (ui.position.left + BASE_MARGIN ) / elWidth ) * 100;
          var ratioRight = 99.98 - ratioLeft;

          this.$left.css('width', ratioLeft + '%');
          this.$right.css('width', ratioRight + '%');

          this.animateHeights(this.determineHeights(this.$textarea.outerHeight(true)), BASE_DURATION);

          // Reset handle style to stick to the right
          this.$vHandle.removeAttr('style');

        }, this)
      });

      this.$hHandle.draggable({
        iframeFix: true,
        axis: 'y',
        cursor: 'row-resize',
        // containment: this.$el,
        drag: _.bind(function (e, ui) {   
          var buttonsHeight = this.$editorButtons.outerHeight(true);
          var h = ui.position.top - buttonsHeight; 
          if (h < MIN_HEIGHT) {
            h = MIN_HEIGHT;
            ui.position.top = h + buttonsHeight;
          } 
          this.animateHeights(this.determineHeights(h), 0);
        }, this),
        stop: _.bind(function (e, ui) {

          this.$hHandle.removeAttr('style');

        }, this)
      });
    },

    slideToFullWidth: function(duration, easing, callback) {
      var winW = $(window).width();

      if (winW > 958) {

        var marginLeft = - (winW - this.$el.prev().outerWidth(true)) / 2;

        // Add some margin to hide the left and right borders
        marginLeft -= 20;
        var w = winW + 40; // + 2*20 to width

        if (this.$el.width() !== w) this.$el.animate({
          'width': w,
          'margin-left': marginLeft
        }, duration, easing, _.bind(function() {
          this.$el.css({'padding': '8px 28px 0px 28px'});
          if (callback) callback();
        }, this));

      } 
    },

    slideToNormalWidth: function(duration, easing, callback) {

      var w = this.$el.prev().width();

      if (this.$el.width() !== w) {
        this.$el.animate({
          'width': 'auto',
          'margin-left': '0'
        }, duration, easing, _.bind(function() {
          this.$el.removeAttr('style');
          if (callback) callback();
        }, this));
      } else {
        if (callback) callback();
      }

    },

    animateHeights: function(heights, duration, callback) {

      if (heights.editor < MIN_HEIGHT) {
        var d = heights.preview - heights.editor;
        heights.editor = MIN_HEIGHT;
        heights.preview = MIN_HEIGHT + d;
      }

      this.$preview.animate({
        'height': heights.preview
      }, duration);

      this.$textarea.animate({
        'height': heights.editor
      }, duration, null, callback);

    },

    /**
     * Determine height for the textarea and preview so that editor fills the 
     * screen, or adjust editor and preview to wanted height
     * 
     * @param  {Number} h  wanted height for textarea (optional)
     * @return {Object}    heights for textarea and preview
     */
    determineHeights: function(h) {

      var eh, ph;
      
      if (!h) {
        // These are static heights, init on first call
        if (!this.heightReduction) this.heightReduction =
          this.$assetToolbar.outerHeight(true) +
          this.$assetList.outerHeight(true) +
          this.$hHandle.outerHeight(true) +
          this.$parentItem.outerHeight(true) +
          (this.$el.outerHeight(true) - this.$el.height());

        // console.log('assetToolbar: ' + this.$assetToolbar.outerHeight(true)); 
        // console.log('assetList: ' + this.$assetList.outerHeight(true)); 
        // console.log('hHandle: ' + this.$hHandle.outerHeight(true)); 
        // console.log('editorButtons: ' + this.$editorButtons.outerHeight(true)); 
        // console.log('parentItem: ' + this.$parentItem.outerHeight(true));

        h = this.windowSize.y;

        var reduction = $('body').cssInt('paddingTop');
        reduction += this.heightReduction;

        h -= reduction;

        eh = h - this.$editorButtons.outerHeight(true);
        ph = h - this.$previewButtons.outerHeight(true);

      } else {

        eh = h;
        ph = h + this.$editorButtons.outerHeight(true) - this.$previewButtons.outerHeight(true);

      }

      return {editor: eh, preview: ph};

    },

    /**
     * Throttled function to update the heights (textarea and preview)
     * 
     * @param  {Number}   height    height of the textarea, null if fit to page height
     * @param  {Number}   duration  animation duration in milliseconds, zero for no animation
     * @param  {Function} callback  function to call when animation done
     * @return {undefined}           
     */
    updateHeight: _.throttle(function(height, duration, callback) {
      this.animateHeights(this.determineHeights(height), duration, callback);
    }, THROTTLE_LIMIT),

    updateWidth: function(duration, callback) {
      if (this.windowSize.x <= 958) {
        this.slideToNormalWidth(duration, null, callback);
      } else {
        this.slideToFullWidth(duration, null, callback);
      }
    },

    updateDimensions: function(callback) {
      this.updateHeight(null, BASE_DURATION, _.bind(function() {
        this.updateWidth(BASE_DURATION, this.updateHeight(null, 0, callback)); // Update height once more after updating width
      }, this));
    },

    toggle: function() {
      // console.log('Editor toggled!');
      if (this.$el.is(':hidden')) {
        this.$el.slideDown(BASE_DURATION, _.bind(function() {
          // if (!this.$textarea) this.$textarea = this.$('.editor-textarea');
          this.updateDimensions(_.bind(function() {
            this.parent.scrollTop();
          }, this));
        }, this));
        this.globalDispatcher.trigger('editorOpened');
      } else {
        this.slideToNormalWidth(BASE_DURATION, null, _.bind(function () {
          this.$el.slideUp();
        }, this));
        this.globalDispatcher.trigger('editorClosed');
      }
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
        error: _.bind(this.onMisakaError, this),
        success: _.bind(this.onMisakaSuccess, this),
        complete: _.bind(this.onMisakaComplete, this)
      });
    },

    onMisakaError: function(jqXHR, textStatus, errorThrown) {
      this.updatePreview(errorThrown);
    },

    onMisakaSuccess: function(data, textStatus, jqXHR) {
      this.updatePreview(data.html);
    },

    onMisakaComplete: function(jqXHR, textStatus) {
      this.activeXhr = null;
    },

    updateImages: function() {
      this.assetList.render();
    }


  });

  return EditorView;

});
