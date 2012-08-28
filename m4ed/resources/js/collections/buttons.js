// Filename: buttons.js
define([
  'underscore',
  'backbone',
  'models/button'
],
function(_, Backbone, ButtonModel) {

  var buttonCollection = Backbone.Collection.extend({

    model: ButtonModel,

    initialize: function(model, options) {}

  });

  return buttonCollection;
});
