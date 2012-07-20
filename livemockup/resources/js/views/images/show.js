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
     this.model.destroy();
    },

    onDragstart: function(e) {
      // Dig up the original event and set the dataTransfer data to contain
      // a bit more meaningful data
      e.originalEvent.dataTransfer.setData('Text', this.model.get('markdown'));
      //  this.model.get('_id')].join(':'));
    },

    onModelChange: function(model) {
      alert('I have changed!');
    }
  });
    
  return assetView;
});
