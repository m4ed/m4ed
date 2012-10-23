<%def name="init_script()">
  <script>
    require(['student/views/navigation' , 'student/app', 'domReady!'], function(NavigationView, App) {

      new NavigationView({el: '.navbar-fixed-top'});

      App.initialize();

    });
  </script>
</%def>
