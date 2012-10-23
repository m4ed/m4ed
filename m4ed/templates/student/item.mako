<%inherit file="base.mako"/>

<%namespace file="menus.mako" import="*"/>

<%block name="title">m4ed - ${item.title}</%block>

<%block name="menus">
  ${context_menu(edit_class='', edit_href='/c/' + str(item.cluster_id) + '/edit')}
</%block>

<%block name="content">

  <ul class="breadcrumb">
    <li><a href="/"><i class="icon-home icon-white"></i></a></li>
    <li class="divider"> </li>
    <li><a href="/c/${item.cluster_id}">${cluster_title}</a></li>
    <li class="divider"> </li>
    <li>${item.title}</li>
  </ul>

  <div class="well m4ed-page">
    ${item.html|n}
  </div>

</%block>

<%block name="footer">
  <div class="footer">
    % if prev_id:
      <a class="btn btn-m4ed" href="/i/${prev_id}"><i class="icon-arrow-left icon-white"></i> Previous</a>
    % endif
    % if next_id:
      <a class="btn btn-m4ed pull-right" href="/i/${next_id}"><i class="icon-arrow-right icon-white"></i> Next</a>
    % endif
  </div>
</%block>

