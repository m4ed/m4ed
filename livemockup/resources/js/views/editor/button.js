// Filename: button.js
define([
  'jquery',
  'underscore',
  'backbone',
  'views/editor/templates'
],
function($, _, Backbone, templates) {
  console.log(templates)

  var buttonView = Backbone.View.extend({

    tagName: 'div',

    className: 'button btn',

    attributes: {
      unselectable: "on"
    },

    initialize: function(options) {
      // Extend this object with all the custom options passed
      _.extend(this, options.custom);
      //this.data = options.button;
      //console.log(this.data);
    },


    events: {
      'click': 'onEditorButtonClick'
    },

    render: function() {
      this.$el.html(templates.button.render(this.model.toJSON()));
      return this;
    },

    onEditorButtonClick: function() {
      var callback = this.model.get('callback');
      this.dispatcher.trigger('editorButtonClick', callback);
    }

  });

  return buttonView;
});
