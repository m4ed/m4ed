// Filename: app.js
define([
  'jquery',
  'underscore',
  'backbone',
  'views/navigation',
  'jquery.hotkeys',
  'jquerypp/cookie',
  'jquery.csrf',
  'bootstrap.collapse',
  'bootstrap.dropdown',
  'bootstrap.modal',
  'bootstrap.transition',
  'bootstrap.button'
], function($, _, Backbone, NavigationView) {
  var initialize = function(dispatcher) {

    // TODO: Move this to somewhere more clever
    // Temp fix to deselect any selected item
    $('body').on('click', function(e) {
      dispatcher.trigger('itemSelected');
    });
    
    new NavigationView({
      el: '.navbar-fixed-top',
      custom: {
        'globalDispatcher': dispatcher
      }
    });

  };

  return {
    initialize: initialize
  };

});