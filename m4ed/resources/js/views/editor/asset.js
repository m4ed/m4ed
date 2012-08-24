// Filename: views/images/asset.js
define([
  'underscore',
  'backbone',
  'views/editor/asseteditor',
  'jquery.hoverintent'
],
function(_, Backbone, AssetEditorView) {
  var AssetView = Backbone.View.extend({

    tagName: 'li',

    className: 'asset',

    initialize: function(options) {

      // Extend this object with all the custom options passed
      _.extend(this, options.custom);

      this.model.bind('change:title', this.onTitleChange, this);

      this.markdown = this.mdTemplate.render({
        alt: 'Alt text goes here',
        src: this.model.get('id')
      });

      this.dispatcher.on('assetSelected', this.onAssetSelected, this);
      this.dispatcher.on('assetSwitch', this.onAssetSwitch, this);
      this.dispatcher.on('assetEdit', this.onAssetEdit, this);

    },

    render: function() {

      var m = this.model;

      this.$el.append(this.template.render({
        src: '/api/assets/' + m.get('id') + '/thumb', // m.get('thumbnail_url')
        alt: m.get('alt'),
        title: m.get('name'),
        buttons: this.buttons
      })); 

      this.$buttons = this.$el.find('.buttons');
      this.$img = this.$el.children('img');

      this.$el.hoverIntent({
        sensitivity: 1,
        interval: 100,
        over: _.bind(this.onHoverOver, this),
        timeout: 100,
        out: _.bind(this.onHoverOut, this)
      });

      this.$img.tooltip({
        title: m.get('title'),
        placement: 'bottom',
        trigger: 'manual'
      });

      return this;
    },

    events: {
      'click': 'onClick',
      'dragstart img': 'onDragstart',
      'click .btn-remove': 'onRemoveClick',
      'click .btn-edit': 'onEditClick',
      'click .btn-insert': 'onInsert'
    },

    select: function() {
      this.dispatcher.trigger('assetSelected', this.model);
      this.$el.addClass('selected');
    },

    deselect: function() {
      this.$el.removeClass('selected');
    },

    isSelected: function() {
      return this.$el.hasClass('selected');
    },

    onAssetSelected: function (model) {
      if (this.isSelected() && !model || model.id !== this.model.id) {
        this.deselect();
      } 
    },

    onInsert: function(e) {
      // Trigger the insertAsset
      // event through our dispatcher, 
      // which the editor view is listening to.
      this.dispatcher.trigger('insertAsset', this.markdown);
     //this.model.destroy();
    },

    onClick: function(e) {
      if (!this.isSelected()) {
        this.select();
      } 
    },

    onDragstart: function(e) {
      e.stopPropagation();
      // Dig up the original event and set the dataTransfer data to contain
      // a bit more meaningful data that the drop event can read
      e.originalEvent.dataTransfer.setData('Text', this.markdown);
    },

    onHoverOver: function(e) {
      e.stopPropagation();
      this.$buttons.fadeIn(300);
      this.$img.tooltip('show');
    },

    onHoverOut: function(e) {
      e.stopPropagation();
      this.$buttons.fadeOut(50);
      this.$img.tooltip('hide');
    },

    onTitleChange: function(model, newTitle, options) {
      this.$img.attr('title', newTitle).tooltip('fixTitle');
    },

    onRemoveClick: function(e) {
      e.stopPropagation();
      this.$img.tooltip('destroy');
      this.model.destroy();
      if (this.editor) this.editor.remove();
      this.remove();
      // alert('Asset removed!');
    },

    onEditClick: function(e) {
      e.stopPropagation();
      // alert('Edit button clicked!');
      this.dispatcher.trigger('assetEdit', this.model);
    },

    onAssetEdit: function(model) {

      if (model === this.model) {

        this.select();  

        if (!this.editor) {
          this.editor = new AssetEditorView({
            model: this.model,
            custom: {
              template: this.editorTemplate,
              dispatcher: this.dispatcher,
              parent: this
            }
          });
          this.editor.render().toggle();
        } else {
          this.editor.toggle();
        }

      }

    }


  });
    
  return AssetView;
});
