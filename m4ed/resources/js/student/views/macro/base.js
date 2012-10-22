define([
    'jquery',
    'underscore',
    'backbone',
    'hogan'
],
function($, _, Backbone, Hogan) {
  var baseView = Backbone.View.extend({

    tagName: 'div',

    className: 'macro',

    initialize: function(options) {
      _.extend(this, options.custom);
      // A template must be required like
      // 'hogantemplates/<templatename>'
      // and passed as 'options.template'

      this.template = new Hogan.Template(options.template);
      $(this.block_id).append(this.el);
      this.render();
    },

    render: function() {
      // This is the default render, override if needed
      this.$el.append(this.template.render(this.model.toJSON()));
      return this;
    }

  });

  return baseView;

});