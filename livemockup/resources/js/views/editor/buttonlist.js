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

    initialize: function(options) {
      // Extend this object with all the custom options passed
      _.extend(this, options.custom);

      this.buttons = new ButtonCollection();
      this.buttons.bind('add', this.onAdd, this);
      //this.buttons.bind('reset', this.onReset, this);



      for (var i in options.buttons) {
        var btn = options.buttons[i];
        console.log(JSON.stringify(btn));
        this.buttons.add(btn);
      }
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
