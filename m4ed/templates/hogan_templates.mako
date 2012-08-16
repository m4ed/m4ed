<%def name="hogan_editor()">
  <script id="editor-template" type="text/hogan">
    <div class="row">
      <div class="span6">
      <!-- The Markdown editor -->
      <div class="btn-toolbar editor-buttons">
      </div>
      <textarea class="span6 editor-textarea">{{text}}</textarea>
      </div>
      <div class="span6">
      <!-- Buttons for preview -->
      <div class="btn-toolbar preview-buttons">
        <div class="btn-group">
        <button class="btn">Desktop</button>
        <button class="btn">Tablet</button>
        <button class="btn">Smartphone</button>
        <button class="btn">Feature phone</button>
        </div>
      </div>
      <div class="preview"></div>
      </div>
    </div>
    
    <!-- Editor control buttons (Save etc.) -->
    <div class="editor-controls">
      <button class="btn btn-primary editor-btn">Save</button>
      <button class="btn editor-btn cancel">Cancel</button>
      <button class="btn editor-btn pictures">Pictures</button>
    </div>

    <!-- Asset container -->
    <div class="asset-container es-carousel-wrapper">
      <div class="es-carousel">
      <ul>
      </ul>
      </div>
    </div>
  </script>
</%def>

<%def name="hogan_asset_editor()">
  <script id="asset-editor" type="text/hogan">
    <div class="modal-header">
      <button type="button" class="close" data-dismiss="modal">&times;</button>
      <h3>{{title}}</h3>
    </div>
    <div class="modal-body">
      <img class="asset-preview" src="{{src}}" />

      <h4 class="title">
        <span class="view">{{title}}</span>
        <input type="text" class="edit" value="{{title}}" data-attr="title" maxlength="160"/>
      </h4>
      <textarea class="tags" rows="1"></textarea>

    </div>
    <div class="modal-footer">
      <div class="asset-editor-nav btn-group pull-left">
        <div class="btn prev"><i class="icon-arrow-left"></i> Prev</div>
        <div class="btn next">Next <i class="icon-arrow-right"></i></div>
      </div>
      <a href="#" class="btn btn-danger" data-dismiss="modal"><i class="icon-trash icon-white"></i> Delete</a>
      <a href="#" class="btn btn-primary" data-dismiss="modal">Close</a>
    </div>
  </script>
</%def>

<%def name="hogan_upload()">
<script id="template-upload" type="text/x-tmpl">
  {% for (var i=0, file; file=o.files[i]; i++) { %}
    <tr class="template-upload fade">
      <td class="preview"><span class="fade"></span></td>
      <td class="name"><span>{%=file.name%}</span></td>
      <td class="size"><span>{%=o.formatFileSize(file.size)%}</span></td>
      {% if (file.error) { %}
        <td class="error" colspan="2"><span class="label label-important">{%=locale.fileupload.error%}</span> {%=locale.fileupload.errors[file.error] || file.error%}</td>
      {% } else if (o.files.valid && !i) { %}
        <td>
          <div class="progress progress-success progress-striped active" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="bar" style="width:0%;"></div></div>
        </td>
        <td class="start">{% if (!o.options.autoUpload) { %}
          <button class="btn btn-primary pull-right">
            <i class="icon-upload icon-white"></i>
            <span>{%=locale.fileupload.start%}</span>
          </button>
        {% } %}</td>
      {% } else { %}
        <td colspan="2"></td>
      {% } %}
      <td class="cancel">{% if (!i) { %}
        <button class="btn btn-warning pull-right">
          <i class="icon-ban-circle icon-white"></i>
          <span>{%=locale.fileupload.cancel%}</span>
        </button>
      {% } %}</td>
    </tr>
  {% } %}
</script>

</%def>

<%def name="hogan_download()">

  <script id="template-download" type="text/x-tmpl">
  {% for (var i=0, file; file=o.files[i]; i++) { %}
    <tr class="template-download fade">
      {% if (file.error) { %}
        <td></td>
        <td class="name"><span>{%=file.name%}</span></td>
        <td class="size"><span>{%=o.formatFileSize(file.size)%}</span></td>
        <td class="error" colspan="2"><span class="label label-important">{%=locale.fileupload.error%}</span> {%=locale.fileupload.errors[file.error] || file.error%}</td>
      {% } else { %}
        <td class="preview">{% if (file.thumbnail_url) { %}
          <a href="{%=file.url%}" title="{%=file.name%}" rel="gallery" download="{%=file.name%}"><img src="{%=file.thumbnail_url%}"></a>
        {% } %}</td>
        <td class="name">
          <a href="{%=file.url%}" title="{%=file.name%}" rel="{%=file.thumbnail_url&&'gallery'%}" download="{%=file.name%}">{%=file.name%}</a>
        </td>
        <td class="size"><span>{%=o.formatFileSize(file.size)%}</span></td>
        <td colspan="2"></td>
      {% } %}
      <td class="delete">
        <button class="btn btn-danger pull-right" data-type="{%=file.delete_type%}" data-url="{%=file.delete_url%}">
          <i class="icon-trash icon-white"></i>
          <span>{%=locale.fileupload.destroy%}</span>
        </button>
        <input type="checkbox" name="delete" value="1">
      </td>
    </tr>
  {% } %}
  </script>

</%def>

<!-- The template to display files available for upload -->
<!-- <script id="template-upload" type="text/x-tmpl">
{% for (var i=0, file; file=o.files[i]; i++) { %}
  <tr class="template-upload fade">
    <td class="preview"><span class="fade"></span></td>
    <td class="name"><span>{%=file.name%}</span></td>
    <td class="size"><span>{%=o.formatFileSize(file.size)%}</span></td>
    {% if (file.error) { %}
      <td class="error" colspan="2"><span class="label label-important">{%=locale.fileupload.error%}</span> {%=locale.fileupload.errors[file.error] || file.error%}</td>
    {% } else if (o.files.valid && !i) { %}
      <td>
        <div class="progress progress-success progress-striped active" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="bar" style="width:0%;"></div></div>
      </td>
      <td class="start">{% if (!o.options.autoUpload) { %}
        <button class="btn btn-primary pull-right">
          <i class="icon-upload icon-white"></i>
          <span>{%=locale.fileupload.start%}</span>
        </button>
      {% } %}</td>
    {% } else { %}
      <td colspan="2"></td>
    {% } %}
    <td class="cancel">{% if (!i) { %}
      <button class="btn btn-warning pull-right">
        <i class="icon-ban-circle icon-white"></i>
        <span>{%=locale.fileupload.cancel%}</span>
      </button>
    {% } %}</td>
  </tr>
{% } %}
</script> -->
<!-- The template to display files available for download -->
<!-- <script id="template-download" type="text/x-tmpl">
{% for (var i=0, file; file=o.files[i]; i++) { %}
  <tr class="template-download fade">
    {% if (file.error) { %}
      <td></td>
      <td class="name"><span>{%=file.name%}</span></td>
      <td class="size"><span>{%=o.formatFileSize(file.size)%}</span></td>
      <td class="error" colspan="2"><span class="label label-important">{%=locale.fileupload.error%}</span> {%=locale.fileupload.errors[file.error] || file.error%}</td>
    {% } else { %}
      <td class="preview">{% if (file.thumbnail_url) { %}
        <a href="{%=file.url%}" title="{%=file.name%}" rel="gallery" download="{%=file.name%}"><img src="{%=file.thumbnail_url%}"></a>
      {% } %}</td>
      <td class="name">
        <a href="{%=file.url%}" title="{%=file.name%}" rel="{%=file.thumbnail_url&&'gallery'%}" download="{%=file.name%}">{%=file.name%}</a>
      </td>
      <td class="size"><span>{%=o.formatFileSize(file.size)%}</span></td>
      <td colspan="2"></td>
    {% } %}
    <td class="delete">
      <button class="btn btn-danger pull-right" data-type="{%=file.delete_type%}" data-url="{%=file.delete_url%}">
        <i class="icon-trash icon-white"></i>
        <span>{%=locale.fileupload.destroy%}</span>
      </button>
      <input type="checkbox" name="delete" value="1">
    </td>
  </tr>
{% } %}
</script> -->