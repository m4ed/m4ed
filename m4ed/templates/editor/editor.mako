<%!
  import json
%>

<%inherit file="base.mako"/>

<%namespace file="item.mako" import="*"/>
<%namespace file="upload.mako" import="*"/>

<%namespace file="hogan/hogan_assets.mako" import="*"/>
<%namespace file="hogan/hogan_download.mako" import="*"/>
<%namespace file="hogan/hogan_editor.mako" import="*"/>
<%namespace file="hogan/hogan_item.mako" import="*"/>
<%namespace file="hogan/hogan_upload.mako" import="*"/>

<%block name="title">m4ed - Content Editor</%block>

<%block name="content">

  <header class="header">
    <div class="location">Learning space / Collection</div>
  </header>

  <!-- The list of items -->
  <ul class="ui-sortable">
  % for item in items:
    <li id='${item._id}' data-index='${item.listIndex}'>
      ${item_template(item.title, item.desc, '/fanstatic/m4ed/img/48x48.gif', json.dumps(item.tags))}
    </li>
  % endfor
  </ul>

  <!-- Modal upload form -->
  ${modal_upload()}

</%block>

<%block name="scripts">

  <!-- Hogan templates -->
  ${hogan_item()}
  ${hogan_editor()}
  ${hogan_assets()}
  ${hogan_upload()}
  ${hogan_download()}

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