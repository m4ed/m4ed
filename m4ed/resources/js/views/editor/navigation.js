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

      this.$deletionSwitch = this.$('.action.toggle-deletion .switch');

    },

    events: {
      'click .action.add': 'onAddClick',
      'click .action.toggle-deletion': 'onToggleDeletionClick',
      'click .dropdown-toggle': 'onDropdownClick'
    },

    onAddClick: function(e) {
      e.preventDefault();
      this.globalDispatcher.trigger('action:addItem');
    },

    onToggleDeletionClick: function(e) {
      e.preventDefault();
      this.globalDispatcher.trigger('action:toggleDeletion');

      var text = this.$deletionSwitch.text();
      text = text === 'Enable' ? 'Disable' : 'Enable';
      this.$deletionSwitch.text(text);

    },

    onDropdownClick: function(e) {
      // e.preventDefault();
    }

  });
  return navigationView;
});