<%!
  from m4ed.util.customjson import dumps
%>

<%inherit file="base.mako"/>

<%namespace file="item.mako" import="*"/>
<%namespace file="hogan/hogan_item.mako" import="*"/>

<%namespace file="menus/context.mako" import="*"/>

<%block name="title">m4ed - Content Editor</%block>

<%block name="context_menu">
  ${context_item()}
</%block>

<%block name="content">

  <header class="header">
    <div class="location">${space.title}</div>
  </header>

  <!-- The list of items -->
  <ul class="ui-sortable">
  % for cluster in space['clusters']:
    <li id='${cluster._id}' data-index='${cluster.listIndex}'>
      ${item_template(cluster.title, cluster.desc, '/fanstatic/m4ed/img/48x48.gif', dumps(cluster.tags))}
    </li>
  % endfor
  </ul>

</%block>

<%block name="scripts">

  <script>
    require(['/fanstatic/m4ed/js/config.js'], function() {
      require(['underscore', 'backbone', 'models/listitem', 'views/editor/space', 'editor_app', 'domReady!'], function(_, Backbone, ListItemModel, SpaceView, App) {

        var ClusterModel = ListItemModel.extend({
          urlRoot: '/api/clusters'
        });

        var ClusterCollection = Backbone.Collection.extend({
          url: '/api/spaces/${space._id}/clusters',
          model: ClusterModel
        });

        var clusters = new ClusterCollection(${dumps(space['clusters']) | n});

        // Make a clone of BackBone.Events and use it as a global event dispatcher
        var dispatcher = _.clone(Backbone.Events);

        new SpaceView({
          el: '.container',
          custom: {
            'globalDispatcher': dispatcher,
            'collection': clusters
          }
        });

        App.initialize(dispatcher);

      });
    });
  </script>

  <!-- Hogan templates -->
  ${hogan_item()}

</%block>