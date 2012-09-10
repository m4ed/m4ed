require(['config'], function() {
    require(['student_app', 'domReady!'], function(App) {
      App.initialize();
    });
});