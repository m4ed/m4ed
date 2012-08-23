## Hogan template for the asset editor

<%def name="hogan_asset_editor()">
  <script id="asset-editor" type="text/hogan">
    <div class="modal-header">
      <button type="button" class="close" data-dismiss="modal">&times;</button>
      <h3>{{title}}</h3>
    </div>
    <div class="modal-body">
      <img class="asset-preview" src="{{thumbnail_url}}" />

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