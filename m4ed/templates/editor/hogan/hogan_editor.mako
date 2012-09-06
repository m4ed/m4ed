## Hogan template for the item editor

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
        <div class="btn-group" data-toggle="buttons-radio">
        <button type="button" class="btn"><i class="icon-size-mini"></i> Mini</button>
        <button type="button" class="btn"><i class="icon-size-small"></i> Small</button>
        <button type="button" class="btn"><i class="icon-size-medium"></i> Medium</button>
        <button type="button" class="btn"><i class="icon-size-large"></i> Large</button>
        </div>
      </div>
      <div class="preview"></div>
      </div>
    </div>
    
    <!-- Asset container (tabindex enables key events)-->
    <div class="asset-container es-carousel-wrapper" tabindex="0">
      <div class="es-carousel">
      <ul>
      </ul>
      </div>
    </div>

    <!-- Asset toolbar -->
    <div class="btn-toolbar asset-toolbar">
      <div class="btn-group dropup asset-folder-select">
        <a class="btn dropdown-toggle" data-toggle="dropdown" href=".asset-folder-select">
          <i class="icon-folder-open"></i> Folder 1 <b class="caret"></b>
        </a>
        <ul class="dropdown-menu">
          <li><a href="#"><i class="icon-history"></i> Recent uploads</a></li>
          <li><a href="#"><i class="icon-trash"></i> Trash</a></li>
          <li class="divider"></li>
          <li><a href="#"><i class="icon-folder-close"></i> Folder 2</a></li>
          <li><a href="#"><i class="icon-folder-close"></i> Folder 3</a></li>
          <li><a href="#"><i class="icon-folder-close"></i> Folder 4</a></li>
        </ul>
      </div>

      <form class="form-search">
        <div class="input-append">
          <input class="search-query" size="16" type="text" placeholder="Search">
          <button type="submit" class="btn">
            <i class="icon-search"></i>
          </button>
        </div>

        <div class="btn-group dropup pull-right search-scope-select">
          <a class="btn dropdown-toggle" data-toggle="dropdown" href=".search-scope-select">
            <b class="caret"></b>
          </a>
          <ul class="dropdown-menu">
            <li><a href="#"><i class="icon-history"></i> Public folders</a></li>
            <li><a href="#"><i class="icon-trash"></i> My folders</a></li>
            <li class="divider"></li>
            <li><a href="#"><i class="icon-folder-open"></i> Current folder</a></li>
          </ul>
        </div>

      </form>

      <div class="btn-group dropup pull-right" id="folder-menu">
        <a class="btn dropdown-toggle" data-toggle="dropdown" href="#folder-menu">
          <i class="icon-folder-close"></i> Actions <b class="caret"></b>
        </a>
        <ul class="dropdown-menu">
          <li><a href="#"><i class="icon-remove"></i> Purge trashed</a></li>
          <li><a href="#"><i class="icon-undo"></i> Restore all trash</a></li>
          <li><a href="#"><i class="icon-trash"></i> Trash this folder</a></li>
          <li class="divider"></li>
          <li><a href="#"><i class="icon-pencil"></i> Rename folder</a></li>
          <li class="divider"></li>
          <li><a href="#"><i class="icon-keys"></i> Folder access control</a></li>
        </ul>
      </div>

      <a class="btn upload pull-right" data-target="#modal-upload" data-toggle="modal">
        <i class="icon-upload"></i> Upload
      </a>

    </div>

  </script>

  <script id="editor-dropdown-toggle" type="text/hogan">
    <a class="btn dropdown-toggle" data-toggle="dropdown" href="#">
      {{label}}
      <span class="caret"></span>
    </a>
  </script>

</%def>