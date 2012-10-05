<%inherit file="../base.mako"/>

<%namespace file="menus.mako" import="*"/>

<%block name="title">m4ed - Content Editor</%block>

<%block name="icons">
  <!-- Le fav and touch icons -->
  <link rel="shortcut icon" href="/fanstatic/m4ed/img/favicon.ico">
  <link rel="apple-touch-icon-precomposed" sizes="144x144" href="/fanstatic/m4ed/bootstrap/ico/apple-touch-icon-144-precomposed.png">
  <link rel="apple-touch-icon-precomposed" sizes="114x114" href="/fanstatic/m4ed/bootstrap/ico/apple-touch-icon-114-precomposed.png">
  <link rel="apple-touch-icon-precomposed" sizes="72x72" href="/fanstatic/m4ed/bootstrap/ico/apple-touch-icon-72-precomposed.png">
  <link rel="apple-touch-icon-precomposed" href="/fanstatic/m4ed/bootstrap/ico/apple-touch-icon-57-precomposed.png">
</%block>

<%block name="menus">
  ${quick_menu()}
  ${context_menu()}
</%block>