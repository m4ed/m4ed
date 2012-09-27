define([
  'jquery',
  'views/student/multi',
  'jquerypp/cookie'
],
function($, MultipleChoiceView) {
  var initialize = function() {
    // What do
  }

  function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
  }

  // Fiddle with the ajax to include the csrf token
  $.ajaxSetup({
    crossDomain: false, // obviates need for sameOrigin test
    beforeSend: function(xhr, settings) {
      if (!csrfSafeMethod(settings.type)) {
          var csrftoken = $.cookie('csrf_token');
          xhr.setRequestHeader("X-CSRFToken", csrftoken);
      }
    }
  });

  return {
    initialize: initialize
  }
});