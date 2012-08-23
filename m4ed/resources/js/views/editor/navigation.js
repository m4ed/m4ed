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
      'click .action.add': 'onAddClick',
      'click .dropdown-toggle': 'onDropdownClick'
    },

    onAddClick: function(e) {
      e.preventDefault();
      this.globalDispatcher.trigger('action:addItem');
    },

    onDropdownClick: function(e) {
      // e.preventDefault();
    }

  });
  return navigationView;
});