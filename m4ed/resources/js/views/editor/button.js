// Filename: button.js
define([
  'jquery',
  'underscore',
  'backbone',
  'views/editor/templates',
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
      //this.data = options.button;
      //console.log(this.data);
    },

    events: {
      'click': 'onEditorButtonClick'
    },

    render: function() {

      this.$el.html(templates.button.render(this.model.toJSON()));
      //console.log(this.model.toJSON());
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

    onEditorButtonClick: function() {
      var callback = this.model.get('callback');
      this.dispatcher.trigger('editorButtonClick', callback);
    }

  });

  return buttonView;
});
