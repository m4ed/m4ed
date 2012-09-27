// Filename: buttonlist.js
define([
  'jquery',
  'underscore',
  'backbone',
  'collections/base',
  'views/editor/button',
  'views/editor/templates'
],
function($, _, Backbone, BaseCollection, ButtonView, templates) {

  var buttonListView = Backbone.View.extend({

    tagName: 'div',

    className: 'btn-group',

    initialize: function(options) {
      // Extend this object with all the custom options passed
      _.extend(this, options.custom);

      this.buttons = new BaseCollection();
      this.buttons.bind('add', this.onAdd, this);

      this.dispatcher.on('closeButtons', this.onCloseButtons, this);

      //this.buttons.bind('reset', this.onReset, this);
      this.buttonData = options.buttons;
      var isDropdown = this.label !== undefined;
      for (var i in this.buttonData) {
        // Set button type (dropdown if label is defined)
        this.buttons.add(this.buttonData[i], {
          isDropdown: isDropdown
        });
      }
    },

    render: function() {
      // Render as dropdown if label is defined
      if (this.label) {
        this.$el.html(templates.dropdownToggle.render({
          label: this.label
        }));
        this.$el.append(this.$buttons);
      } else {
        this.$el.append(this.$buttons.children());
      }
      return this;
    },

    onAdd: function(button, collection, options) {

      var isDropdown = options.isDropdown;

      var wrapper = isDropdown ? '<ul class="dropdown-menu">' : '<div>';
      var className = isDropdown ? 'dropdown-item' : 'btn';

      var buttonView = new ButtonView({
        model: button,
        className: className,
        custom: {
          dispatcher: this.dispatcher,
          parent: this,
          hideLabel: this.hideLabels
        }
      });
      var $button = buttonView.render().$el;
      if (isDropdown) $button = $('<li>').append($button); 
      if (!this.$buttons) {
        this.$buttons = $(wrapper);
      }
      this.$buttons.append($button);
    },

    onCloseButtons: function(e) {
      var buttons = this.buttons;
      while (buttons.length > 0) {
        buttons.pop().destroy();
      }
      this.close();
      // console.log('Buttonlist closed.');
    }

  });

  return buttonListView;
});