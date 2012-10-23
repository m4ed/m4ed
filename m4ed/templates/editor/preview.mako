<!DOCTYPE html>
<head>
  <%block name="head">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">
    <title><%block name="title">m4ed - Preview</%block></title>


    <script src="/fanstatic/m4ed/js/lib/requirejs/require.js"></script>
    <%block name="require_config">
      <script src="/fanstatic/m4ed/js/student/config.js"></script>
    </%block>
  </%block>
</head>
<body>

  <div class="container">
    <div class="m4ed-page">
      ${item.html|n}
    </div>
  </div>

  <script>
    require([
      'jquery',
      'underscore',
      'backbone',
      'student/app',
      'domReady!',
      'jquery.postmessage'
    ], function($, _, Backbone, App) {

      var PreviewView = Backbone.View.extend({

        initialize: function(options) {
          _.extend(this, options.custom);
          // Listen to messages from parent window
          $(document).onMessage(_.bind(function (e) {
            this.update(e.data);
          }, this));
        },

        update: function(html) {
          this.$el.html(html);
        }

      });

      new PreviewView({
        el: '.m4ed-page'
      });

      App.initialize();
    });
  </script>

</body>
