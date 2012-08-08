// Filename: buttonlist.js
define([
  'jquery',
  'underscore',
  'backbone',
  'hogan',
  'collections/buttons',
  'views/editor/button'
],
function($, _, Backbone, hogan, ButtonCollection, ButtonView) {

  var buttonListView = Backbone.View.extend({

    tagName: 'div',

    className: 'btn-group',

    initialize: function(options) {
      // Extend this object with all the custom options passed
      _.extend(this, options.custom);

      this.buttons = new ButtonCollection();
      this.buttons.bind('add', this.onAdd, this);
      //this.buttons.bind('reset', this.onReset, this);
      this.buttonData = options.buttons;
    },

    render: function() {
      //console.log(this.el);
      for (var i in this.buttonData) {
        this.buttons.add(this.buttonData[i]);
      }
      return this;
    },

    onAdd: function(button, collection, options) {
      var buttonView = new ButtonView({
        model: button,

        custom: {
          dispatcher: this.dispatcher,
          parent: this
        }
      });
      var el = buttonView.render().el;

      this.$el.append(el);


    }

  });

  return buttonListView;
});
