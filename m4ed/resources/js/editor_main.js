require(['config'], function() {
    require(['editor_app', 'domReady!'], function(App) {
      App.initialize();
    });
});