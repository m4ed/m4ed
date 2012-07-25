// Filename: button.js
define([
  'jquery',
  'underscore',
  'backbone'
],
function($, _, Backbone) {

  var buttonView = Backbone.View.extend({

    initialize: function(options) {
      // Extend this object with all the custom options passed
      _.extend(this, options.custom);
      //this.data = options.button;
      //console.log(this.data);
    },

    events: {
      'click': 'toggle'
    },

    render: function() {
      this.$el.html(this.template.render(this.model.toJSON()));
      return this;
    },

    toggle: function() {
      var callback = this.model.get('callback');
      this.dispatcher.trigger('insertMarkdown', callback);
    }

  });

  return buttonView;
});
