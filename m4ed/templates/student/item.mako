<%inherit file="base.mako"/>

<%namespace file="hogan/multiplechoice.mako" import="*"/>
<%namespace file="hogan/audio.mako" import="*"/>

<%block name="title">m4ed - ${item.title}</%block>

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

  <div class="well sound-test">
  </div>
</%block>

<%block name="hogan_templates">
  ${hogan_multiplechoice()}
  ${hogan_audio()}
</%block>