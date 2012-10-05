<%def name="init_script(view, model_url)">
  <script>
    require(['/fanstatic/m4ed/js/config.js'], function() {
      require(['underscore', 'backbone', '${view}', 'student_app', 'domReady!'], function(_, Backbone, View, App) {

        var Model = Backbone.Model.extend({
          urlRoot: '${model_url}'
        });

        var Collection = Backbone.Collection.extend({
          url: '${collection_url}',
          model: Model
        });

        var col = new Collection(${json_collection | n});

        // Make a clone of BackBone.Events and use it as a global event dispatcher
        var disp = _.clone(Backbone.Events);

        new View({
          el: '.container',
          custom: {
            'globalDispatcher': disp,
            'collection': col
          }
        });

        App.initialize(disp);

      });
    });
  </script>
</%def>
