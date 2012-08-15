<%def name="modal_upload()">
  <div id="modal-upload" class="modal-upload modal hide fade">
    <form id="fileupload" class="fileupload modal-form" action="/upload" method="POST" enctype="multipart/form-data">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal">×</button>
        <div class="dropdown" id="upload-folder-dropdown">
          <a class="btn dropdown-toggle" data-toggle="dropdown" href="#upload-folder-dropdown">
            Folder 1
            <b class="caret"></b>
          </a>
          <ul class="dropdown-menu">
            <li><a href="#">Folder 2</a></li>
            <li><a href="#">Folder 3</a></li>
          </ul>
        </div>
        <h3>Upload files to </h3>
      </div>
      <div class="modal-body">
        <div class="fileupload-progress fade" style="display: none;">
            <div class="progress progress-success progress-striped active" role="progressbar" aria-valuemin="0" aria-valuemax="100">
                <div class="bar" style="width:0%;"></div>
            </div>
            <div class="progress-extended">&nbsp;</div>
        </div>
        <div class="fileupload-loading"></div>
        <div class="drop-icon">
          <div class="drop-text"><h4>Drop files here...</h4></div>
        </div>
        <table role="presentation" class="table table-striped">
          <tbody class="files"></tbody>
        </table>
      </div>
      <div class="modal-footer fileupload-buttonbar">
        <span class="btn btn-success fileinput-button">
            <i class="icon-plus icon-white"></i>
            <span>Add files...</span>
            <input type="file" name="files[]" multiple>
        </span>
        <button type="submit" class="btn btn-primary start pull-left">
            <i class="icon-upload icon-white"></i>
            <span>Upload all</span>
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
</%def>