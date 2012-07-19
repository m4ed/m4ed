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
      return { 
        src: this.model.get('src'),
        alt: this.model.get('alt'),
        title: this.model.get('title')
      }
    },

    initialize: function(options) {
      this.model.bind('change', this.onModelChange, this);
    },

    render: function() {
      return this;
    },

    events: {
     'click': 'onClick',
     'dragstart': 'onDragstart'
    },

    onClick: function(e) {
      alert('Derp');
    },

    onDragstart: function(e) {
      e.originalEvent.dataTransfer.setData('Text', this.model.get('markdown'));
      //console.log('markdown copied');
      //return this.model.markdown;
    },

    onModelChange: function(model) {
      alert('I have changed!');
    }
  });
    
  return assetView;
});
