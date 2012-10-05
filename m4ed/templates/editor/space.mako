<%!
  from m4ed.util.customjson import dumps
%>

<%inherit file="base.mako"/>

<%namespace file="item.mako" import="*"/>
<%namespace file="hogan/hogan_item.mako" import="*"/>
<%namespace file="init.mako" import="*"/>

<%block name="title">m4ed - ${space.title}</%block>

<%block name="content">

  <ul class="breadcrumb">
    <li><a href="/edit"><i class="icon-home icon-white"></i></a></li>
    <li class="divider"> </li>
    <li>${space.title}</li>
  </ul>

  <!-- The list of items -->
  <ul class="ui-sortable">
  % for cluster in space['clusters']:
    <li id='${cluster._id}'>
      ${item_template(cluster.title, cluster.desc, '/fanstatic/m4ed/img/48x48.gif', dumps(cluster.tags))}
    </li>
  % endfor
  </ul>

</%block>

<%block name="scripts">

  ${init_script('views/editor/spaceclusters', dumps(space['clusters']), '/api/spaces/' + str(space._id) + '/clusters', '/api/clusters')}

  <!-- Hogan templates -->
  ${hogan_item()}

</%block>