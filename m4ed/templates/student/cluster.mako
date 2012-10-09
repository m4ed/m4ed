<%inherit file="base.mako"/>

<%namespace file="listitem.mako" import="*"/>

<%block name="title">m4ed - ${cluster.title}</%block>

<%block name="content">

  <ul class="breadcrumb">
    <li><a href="/"><i class="icon-home icon-white"></i></a></li>
    <li class="divider"> </li>
    <li><a href="/s/${cluster.space_id}">${space_title}</a></li>
    <li class="divider"> </li>
    <li>${cluster.title}</li>
  </ul>

  <!-- The list of items -->
  <ul class="item-list">
  % for item in cluster['items']:
    <li id='${item._id}'>
      ${item_template('/i/' + str(item._id), item.title, item.desc, '/fanstatic/m4ed/img/48x48.gif')}
    </li>
  % endfor
  </ul>

</%block>