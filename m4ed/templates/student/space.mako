<%inherit file="base.mako"/>

<%namespace file="listitem.mako" import="*"/>

<%block name="title">m4ed - ${space.title}</%block>

<%block name="content">

  <ul class="breadcrumb">
    <li><a href="/"><i class="icon-home icon-white"></i></a></li>
    <li class="divider"> </li>
    <li>${space.title}</li>
  </ul>

  <!-- The list of items -->
  <ul class="item-list">
  % for cluster in space['clusters']:
    <li id='${cluster._id}'>
      ${item_template('/c/' + str(cluster._id), cluster.title, cluster.desc, '/fanstatic/m4ed/img/48x48.gif')}
    </li>
  % endfor
  </ul>

</%block>