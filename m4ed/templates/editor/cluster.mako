<%!
  from m4ed.util.customjson import dumps
%>

<%inherit file="base.mako"/>

<%namespace file="listitem.mako" import="*"/>
<%namespace file="upload.mako" import="*"/>

<%namespace file="hogan/hogan_assets.mako" import="*"/>
<%namespace file="hogan/hogan_download.mako" import="*"/>
<%namespace file="hogan/hogan_editor.mako" import="*"/>
<%namespace file="hogan/hogan_item.mako" import="*"/>
<%namespace file="hogan/hogan_upload.mako" import="*"/>
<%namespace file="init.mako" import="*"/>

<%namespace file="../student/hogan/multiplechoice.mako" import="*"/>
<%namespace file="../student/hogan/audio.mako" import="*"/>

<%block name="title">m4ed - ${cluster.title}</%block>

<%block name="content">

  <ul class="breadcrumb">
    <li><a href="/edit"><i class="icon-home icon-white"></i></a></li>
    <li class="divider"> </li>
    <li><a href="/s/${cluster.space_id}/edit">${space_title}</a></li>
    <li class="divider"> </li>
    <li>${cluster.title}</li>
  </ul>

  <!-- The list of items -->
  <ul class="ui-sortable">
  % for item in cluster['items']:
    <li id='${item._id}'>
      ${item_template(item.title, item.desc, '/fanstatic/m4ed/img/48x48.gif', dumps(item.tags))}
    </li>
  % endfor
  </ul>

  <!-- Modal upload form -->
  ${modal_upload()}

</%block>

<%block name="scripts">

  ${init_script('views/clusteritems', dumps(cluster['items']), '/api/clusters/' + str(cluster._id) + '/items', '/api/items')}

  <!-- Hogan templates -->
  ${hogan_item()}
  ${hogan_editor()}
  ${hogan_assets()}
  ${hogan_upload()}
  ${hogan_download()}

  <!-- Hogan templates for preview-->
  ${hogan_multiplechoice()}
  ${hogan_audio()}

  <!--
    File Upload locale temporarily here,
    until a common locale system is implemented
  -->

  <script>
  window.locale = {
    "fileupload": {
      "errors": {
        "maxFileSize": "File is too big",
        "minFileSize": "File is too small",
        "acceptFileTypes": "Filetype not allowed",
        "maxNumberOfFiles": "Max number of files exceeded",
        "uploadedBytes": "Uploaded bytes exceed file size",
        "emptyResult": "Empty file upload result"
      },
      "error": "Error",
      "start": "Upload",
      "cancel": "Cancel",
      "destroy": "Delete"
    }
  };
  </script>

</%block>