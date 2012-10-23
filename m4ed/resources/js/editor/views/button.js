// Filename: button.js
define([
  'jquery',
  'underscore',
  'backbone',
  'views/templates',
  'bootstrap.tooltip'
],
function($, _, Backbone, templates) {
  //console.log(templates)

  var buttonView = Backbone.View.extend({

    tagName: 'a',

    attributes: {
      href: '#'
    },

    initialize: function(options) {
      // Extend this object with all the custom options passed
      _.extend(this, options.custom);

      // this.dispatcher.on('close', this.onClose, this);
      this.model.bind('destroy', this.onDestroy, this);

    },

    events: {
      'click': 'onClick'
    },

    render: function() {

      this.$el.html(templates.button.render(this.model.toJSON()));

      if (this.hideLabel) {
        var label = this.model.get('label');
        this.$el.tooltip({
          title: label ? label : 'No tooltip available.',
          delay: {
            show: 1500,
            hide: 200
          }
        });
        this.$('.btn-label').addClass('hide');
      }

      return this;

    },

    onClick: function(e) {
      e.preventDefault();
      var callback = this.model.get('callback');
      if (callback) this.dispatcher.trigger('editorButtonClick', callback);
    },

    onDestroy: function(e) {
      this.$el.tooltip('destroy');
      this.close();
      // console.log('Button closed.');
    }

  });

  return buttonView;
});
