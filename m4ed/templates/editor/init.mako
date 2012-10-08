<%def name="init_script(view, json_collection, collection_url, model_url)">
  <script>
    require(['/fanstatic/m4ed/js/config.js'], function() {
      require(['underscore', 'backbone', 'models/listitem', '${view}', 'editor_app', 'domReady!'], function(_, Backbone, ListItemModel, View, App) {

        var Model = ListItemModel.extend({
          urlRoot: '${model_url}'
        });

        var Collection = Backbone.Collection.extend({
          url: '${collection_url}',
          model: Model
        });

        var collection = new Collection(${json_collection | n});

        // Make a clone of BackBone.Events and use it as a global event dispatcher
        var globalDispatcher = _.clone(Backbone.Events);

        new View({
          el: '.container',
          custom: {
            'globalDispatcher': globalDispatcher,
            'collection': collection
          }
        });

        App.initialize(disp);

      });
    });
  </script>
</%def>
