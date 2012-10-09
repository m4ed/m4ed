<%inherit file="../base.mako"/>

<%namespace file="menus.mako" import="*"/>
<%namespace file="init.mako" import="*"/>

<%block name="title">m4ed - Mobile for Education</%block>

<%block name="menus">
  ${context_menu()}
</%block>

<%block name="scripts">
  ${init_script()}
  <%block name="hogan_templates"></%block>
</%block>