require(['/fanstatic/m4ed/js/config.js'], function() {
    require(['editor_app', 'domReady!'], function(App) {
      App.initialize();
    });
});