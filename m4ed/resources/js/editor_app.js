// Filename: app.js
define([
  'jquery',
  'underscore',
  'backbone',
  'views/editor/itemlist',
  'views/editor/navigation',
  'jquery.hotkeys',
  'jquerypp/cookie',
  'bootstrap.collapse',
  'bootstrap.dropdown',
  'bootstrap.modal',
  'bootstrap.transition',
  'bootstrap.button'
], function($, _, Backbone, ItemListView, NavigationView) {
  var initialize = function() {

    // Make a clone of BackBone.Events and use it as a global event dispatcher
    var dispatcher = _.clone(Backbone.Events);


    // TODO: Move this to somewhere more clever
    // Temp fix to deselect any selected item
    $('body').on('click', function(e) {
      dispatcher.trigger('itemSelected');
    });

    new ItemListView({
      el: '.container', 
      custom: {
        'globalDispatcher': dispatcher
      }
    });
    
    new NavigationView({
      el: '.navbar-fixed-top',
      custom: {
        'globalDispatcher': dispatcher
      }
    });

    function csrfSafeMethod(method) {
      // these HTTP methods do not require CSRF protection
      return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    // Fiddle with the ajax to include the csrf token
    $.ajaxSetup({
      crossDomain: false, // obviates need for sameOrigin test
      beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type)) {
            var csrftoken = $.cookie('csrftoken');
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
      }
    });

  };

  return {
    initialize: initialize
  };

});