// Filename: views/items/navigation.js
define([
  'underscore',
  'backbone'
],
function(_, Backbone) {

  var navigationView = Backbone.View.extend({

    initialize: function(options) {
      // Extend this object with all the custom options passed
      _.extend(this, options.custom);
    },

    events: {
      'click .edit-mode': 'onEditModeClick'
    },

    onEditModeClick: function(e) {
      var href = window.location.href.replace(/(#.*|\/$)/, '');
      href += '/edit';
      window.location.href = href;
    }

  });

  return navigationView;

});
