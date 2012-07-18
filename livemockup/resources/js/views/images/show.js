// Filename: views/images/show.js
define([
  'underscore',
  'backbone',
  'models/asset'
],
function(_, Backbone, ImageModel) {
  var imageView = Backbone.View.extend({

    tagName: 'img',

    className: 'picture',

    attributes: function() {
      //console.log(this.model);
      return { 
        src: this.model.get('src')
      }
    },

    initialize: function(options) {
      //console.log('ItemView initialized.');
      //this.parent = options.parent;
      this.model.bind('change', this.onModelChange, this);
      //this.template = hogan.compile($('#image-template').html())
    },

    render: function() {
      return this;
    },

    events: {
     'click': 'onClick'
    },

    onClick: function(e) {
      alert('Derp');
    },

    onModelChange: function(model) {
      alert('I have changed!');
    }
  });
    
  return imageView;
});
