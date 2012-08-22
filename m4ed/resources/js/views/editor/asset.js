// Filename: views/images/asset.js
define([
  'underscore',
  'backbone',
  'views/editor/asseteditor'
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

      // Index for elastislide
      this.index = options.index;
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
      this.$img = this.$el.find('img');

      this.$img.tooltip({
        title: m.get('title'),
        placement: 'bottom',
        delay: {
          show: 700,
          hide: 50
        }
      });

      return this;
    },

    events: {
      'click': 'onClick',
      'dragstart img': 'onDragstart',
      'hoverintent': 'onHoverIntent',
      'mouseleave': 'onMouseLeave',
      'click .btn-remove': 'onRemove',
      'click .btn-edit': 'onEdit',
      'edit': 'onEdit',
      'click .btn-insert': 'onInsert'
    },

    onInsert: function(e) {
      // Trigger the insertImage
      // event through our dispatcher, 
      // which the editor view is listening to.
      this.dispatcher.trigger('insertImage', this.markdown);
     //this.model.destroy();
    },

    onClick: function(e) {
      this.dispatcher.trigger('assetSelected', this.index);
      this.$el.addClass('selected');
    },

    onDragstart: function(e) {
      e.stopPropagation();
      // Dig up the original event and set the dataTransfer data to contain
      // a bit more meaningful data that the drop event can read
      e.originalEvent.dataTransfer.setData('Text', this.markdown);
    },

    onHoverIntent: function(e) {
      e.stopPropagation();
      this.$buttons.fadeIn(700);
    },

    onMouseLeave: function(e) {
      e.stopPropagation();
      this.$buttons.fadeOut(50);
    },

    onTitleChange: function(model, newTitle, options) {
      this.$img.attr('title', newTitle).tooltip('fixTitle');
    },

    onRemove: function(e) {
      e.stopPropagation();
      this.model.destroy();
      this.remove();
      // alert('Asset removed!');
    },

    onEdit: function(e) {
      e.stopPropagation();
      // alert('Edit button clicked!');

      this.$el.addClass('selected');
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


  });
    
  return AssetView;
});
