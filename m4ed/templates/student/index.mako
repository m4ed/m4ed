<%inherit file="base.mako"/>

<%namespace file="item.mako" import="*"/>

<%block name="content">

  <ul class="breadcrumb">
    <li><i class="icon-home icon-white"></i></li>
  </ul>

  <!-- The list of items -->
  <ul class="item-list">
  % for space in spaces:
    <li id='${space._id}'>
      ${item_template('/s/' + str(space._id), space.title, space.desc, '/fanstatic/m4ed/img/48x48.gif')}
    </li>
  % endfor
  </ul>

  <p><a class="btn btn-small" href="${logout_url}">Logout</a></p>

</%block>