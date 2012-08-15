<%inherit file="base.mako"/>

<%namespace file="hogan_templates.mako" import="*"/>
<%namespace file="upload.mako" import="modal_upload"/>

<%block name="title">m4ed - Content Editor</%block>

<%block name="content">

  <header class="header">
    <div class="user-info">
      <div class="avatar">
      </div>
      <div class="user-name">
        <span>User Name</span>
      </div>
    </div>
    <div class="location">Learning space / Collection</div>
  </header>

  <!-- The list of items -->
  <ul class="ui-sortable">
  % for item in items:
    <li id='${item._id}'>
      ${item_template(item._id, item.title, item.desc, 'http://placehold.it/48x48', item.type)}
    </li>
  % endfor
  </ul>

  <!-- Modal upload form -->
  ${modal_upload()}

  <!-- Hogan templates -->
  ${hogan_editor()}
  ${hogan_asset_editor()}
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

<%def name="item_template(_id, title, desc, icon, classname)">
  <div class="item ${classname}" data-id="${_id}">
    <div class="item-icon">
      <img src="${icon}" />
    </div>
    <div class="handle">
    </div>
    <div class="item-content">
      <h4 class="title">
        <span class="view">${title}</span>
        <input type="text" class="edit" value="${title}" data-attr="title" maxlength="160"/>
      </h4>
      <p class="desc">
        <span class="view">${desc}</span>
        <input type="text" class="edit" value="${desc}" data-attr="desc" maxlength="160"/>
      </p>
    </div>
  </div>
</%def>