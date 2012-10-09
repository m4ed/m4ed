<%inherit file="base.mako"/>

<%namespace file="hogan/multiplechoice.mako" import="*"/>

<%block name="title">m4ed - ${item.title}</%block>

<%block name="content">

  <ul class="breadcrumb">
    <li><a href="/"><i class="icon-home icon-white"></i></a></li>
    <li class="divider"> </li>
    <li><a href="/c/${item.cluster_id}">${cluster_title}</a></li>
    <li class="divider"> </li>
    <li>${item.title}</li>
  </ul>

  <div class="well">
    ${item.html|n}
  </div>
</%block>

<%block name="hogan_templates">
  ${hogan_multiplechoice()}
</%block>