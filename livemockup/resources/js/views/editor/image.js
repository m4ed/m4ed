// Filename: views/images/show.js
define([
  'underscore',
  'backbone'
],
function(_, Backbone) {
  var assetView = Backbone.View.extend({

    tagName: 'li',

    className: 'asset',

    initialize: function(options) {

      // Extend this object with all the custom options passed
      _.extend(this, options.custom);

      this.model.bind('change', this.onModelChange, this);
      this.markdown = this.mdTemplate.render({
        alt: 'Alt text goes here',
        src: this.model.get('src')
      });
    },

    render: function() {

      var m = this.model;

      this.$el.append(this.template.render({
        src: m.get('src'),
        alt: m.get('alt'),
        title: m.get('title'),
        buttons: this.buttons
      })); 

      this.$buttons = this.$el.find('.buttons');

      this.$el.find('img').tooltip({
        title: m.get('desc'),
        placement: 'bottom',
        delay: {
          show: 700,
          hide: 100
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
      'click .btn-edit': 'onEdit'
    },

    onClick: function(e) {
      e.stopPropagation();
      // Trigger the insertImage
      // event through our dispatcher, 
      // which the editor view is listening to.
      this.dispatcher.trigger('insertImage', this.markdown);
     //this.model.destroy();
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

    onModelChange: function(model, options) {
      alert('Asset model changed!');
    },

    onRemove: function(e) {
      e.stopPropagation();
      this.model.destroy();
      this.remove();
      alert('Asset removed!');
    },

    onEdit: function(e) {
      e.stopPropagation();
      alert('Edit button clicked!');
    }


  });
    
  return assetView;
});
