// Filename: views/images/show.js
define([
  'underscore',
  'backbone'
],
function(_, Backbone) {
  var assetView = Backbone.View.extend({

    tagName: 'img',

    className: 'picture',

    attributes: function() {
      var m = this.model;
      return { 
        src: m.get('src'),
        alt: m.get('alt'),
        title: m.get('title')
      };
    },

    initialize: function(options) {

      // Extend this object with all the custom options passed
      _.extend(this, options.custom);

      this.model.bind('change', this.onModelChange, this);
      this.markdown = options.imgTemplate.render({
        alt: 'Alt text goes here',
        src: this.model.get('src')
      });
    },

    render: function() {
      // We have nothing to render since the element is just an
      // img tag with attributes...
      return this;
    },

    events: {
      'click': 'onClick',
      'dragstart': 'onDragstart'
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

    onModelChange: function(model, options) {
      alert('I have changed!');
    }
  });
    
  return assetView;
});
