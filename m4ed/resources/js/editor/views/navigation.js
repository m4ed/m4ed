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

      this.globalDispatcher.on('list:toggleDeletion', this.onToggleDeletion, this);

      this.buttons = {
        '$add': this.$('.action.add').parent(),
        '$duplicate': this.$('.action.duplicate').parent(),
        '$toggleDeletion': this.$('.action.toggle-deletion').parent()
      };

      this.globalDispatcher.on('nav:toggleButton', this.onToggleButton, this);

    },

    events: {
      'click .normal-mode': 'onNormalModeClick',
      'click .action.add': 'onAddClick',
      'click .action.duplicate': 'onDuplicateClick',
      'click .action.toggle-deletion': 'onToggleDeletionClick'
    },

    onNormalModeClick: function(e) {
      window.location.href = window.location.href.replace(/(\/edit.*)/, '');
    },

    onAddClick: function(e) {
      e.preventDefault();
      this.handleAction(this.buttons.$add, 'list:addNew');
    },

    onDuplicateClick: function(e) {
      e.preventDefault();
      this.handleAction(this.buttons.$duplicate, 'list:duplicate');
    },

    handleAction: function($button, action) {
      if (!$button.hasClass('disabled')) {
        this.globalDispatcher.trigger(action);
        $button.addClass('disabled');
      }
    },

    onToggleDeletionClick: function(e) {
      e.preventDefault();
      this.globalDispatcher.trigger('list:toggleDeletion');
    },

    onToggleDeletion: function(e) {
      var $effect = this.buttons.$toggleDeletion.find('.effect');
      var text = $effect.text();
      text = text === 'Enable' ? 'Disable' : 'Enable';
      $effect.text(text);
    },

    onToggleButton: function(name, state) {

      var $button;
      switch (name) {
        case 'duplicate':
          $button = this.buttons.$duplicate;
          break;
        case 'add':
          $button = this.buttons.$add;
          break;
        default:
          return;
      }

      if (!state) {
        $button.toggleClass('disabled');
      } else if (state === 'on') {
        $button.removeClass('disabled');
      } else {
        $button.addClass('disabled');
      }
    }

  });
  return navigationView;
});