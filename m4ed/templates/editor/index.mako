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

<!--   <header class="header">
    <div class="location">Index</div>

  </header>
 -->
  <ul class="breadcrumb">
    <li><a href="/edit"><i class="icon-home icon-white"></i></a></li>
  </ul>

  <!-- The list of items -->
  <ul class="ui-sortable">
  % for space in spaces:
    <li id='${space._id}' data-index='${space.listIndex}'>
      ${item_template(space.title, space.desc, '/fanstatic/m4ed/img/48x48.gif', dumps(space.tags))}
    </li>
  % endfor
  </ul>

</%block>

<%block name="scripts">

  <script>
    require(['/fanstatic/m4ed/js/config.js'], function() {
      require(['underscore', 'backbone', 'models/listitem', 'views/editor/root', 'editor_app', 'domReady!'], function(_, Backbone, ListItemModel, RootView, App) {

        var SpaceModel = ListItemModel.extend({
          urlRoot: '/api/spaces'
        });

        var SpaceCollection = Backbone.Collection.extend({
          url: '/api/spaces',
          model: SpaceModel
        });

        var spaces = new SpaceCollection(${dumps(spaces_array) | n});

        // Make a clone of BackBone.Events and use it as a global event dispatcher
        var dispatcher = _.clone(Backbone.Events);

        new RootView({
          el: '.container',
          custom: {
            'globalDispatcher': dispatcher,
            'collection': spaces
          }
        });

        App.initialize(dispatcher);

      });
    });
  </script>

  <!-- Hogan templates -->
  ${hogan_item()}

</%block>