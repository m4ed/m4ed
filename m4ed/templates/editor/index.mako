<%!
  from m4ed.util.customjson import dumps
%>

<%inherit file="base.mako"/>

<%namespace file="item.mako" import="*"/>
<%namespace file="hogan/hogan_item.mako" import="*"/>
<%namespace file="init.mako" import="*"/>

<%block name="content">

  <ul class="breadcrumb">
    <li><i class="icon-home icon-white"></i></li>
  </ul>

  <!-- The list of items -->
  <ul class="ui-sortable">
  % for space in spaces:
    <li id='${space._id}'>
      ${item_template(space.title, space.desc, '/fanstatic/m4ed/img/48x48.gif', dumps(space.tags))}
    </li>
  % endfor
  </ul>

</%block>

<%block name="scripts">

  ${init_script('views/editor/root', dumps(spaces_array), '/api/spaces', '/api/spaces')}

  <!-- Hogan templates -->
  ${hogan_item()}

</%block>