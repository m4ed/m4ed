<%inherit file="base.mako"/>

<%namespace file="hogan_templates.mako" import="*"/>

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

  <ul class="ui-sortable">
  % for item in items:
    <li id='${item._id}'>
      ${item_template(item._id, item.title, item.desc, 'http://placehold.it/48x48', item.type)}
    </li>
  % endfor
  </ul>

  <div id="modal-upload" class="modal-upload modal hide fade">
    <div class="modal-header">
      <button type="button" class="close" data-dismiss="modal">×</button>
      <h3>Upload files</h3>
    </div>
    <form id="fileupload" class="fileupload modal-form" action="/upload" method="POST" enctype="multipart/form-data">
      <div class="modal-body">
        <div class="fileupload-progress hide">
            <div class="progress progress-success progress-striped active" role="progressbar" aria-valuemin="0" aria-valuemax="100">
                <div class="bar" style="width:0%;"></div>
            </div>
            <div class="progress-extended">&nbsp;</div>
        </div>
        <div class="fileupload-loading"></div>
        <table role="presentation" class="table table-striped"><tbody class="files" data-toggle="modal-gallery" data-target="#modal-gallery"></tbody></table>
      </div>
      <div class="modal-footer fileupload-buttonbar">
        <span class="btn btn-success fileinput-button">
            <i class="icon-plus icon-white"></i>
            <span>Add files...</span>
            <input type="file" name="files[]" multiple>
        </span>
        <button type="submit" class="btn btn-primary start pull-left">
            <i class="icon-upload icon-white"></i>
            <span>Start upload</span>
        </button>
        <button type="reset" class="btn btn-warning cancel pull-left">
            <i class="icon-ban-circle icon-white"></i>
            <span>Cancel upload</span>
        </button>
<!--         <button type="button" class="btn btn-danger delete pull-left">
            <i class="icon-trash icon-white"></i>
            <span>Delete</span>
        </button>
        <input type="checkbox" class="toggle pull-left"> -->
        <a href="#" class="btn" data-dismiss="modal">Cancel</a>
      </div>
    </form>
  </div>

  ${hogan_editor()}

  ${hogan_upload()}
  ${hogan_download()}

<!-- File Upload locale temporarily here -->
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
        "start": "Start",
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