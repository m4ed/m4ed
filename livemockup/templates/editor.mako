<%inherit file="base.mako"/>

<%block name="title">m4ed - Content Editor</%block>


<%block name="content">
  <ul class="ui-sortable">
  % for item in items:
    <li id='${item._id}'>
      ${item_template(item._id, item.title, item.desc, 'http://placehold.it/48x48', item.type)}
    </li>
  % endfor
  </ul>

  ${hogan_editor()}

  ## ${hogan_wysiwym()}
  ## ${hogan_wysiwym_button()}

</%block>

<%def name="item_template(_id, title, desc, icon, classname)">
  <div class="well item ${classname}" data-id="${_id}">
    <div class="item-icon">
      <img src="${icon}" />
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

<%def name="hogan_wysiwym()">
  <script id="wysiwym-editor-template" type="text/hogan">
  <div class="span6 editor-wrap">
    <div class="btn-toolbar editor-buttons">
    </div>
    <div class="wysiwym-editor">
    <textarea class="span6 editor-textarea">{{text}}</textarea>
    </div>
  </div>
  </script>
</%def>

<%def name="hogan_wysiwym_button()">
  <script id="wysiwym-button-template" type="text/hogan">
    <div class="button btn {{buttonclass}}" unselectable="on">
      <span class="wrap" unselectable="on">
        <span class="text" style="display:{{display}}" unselectable="on">{{name}}</span>
        <i class="icon-{{icon}}"></i>
      </span>
    </div>
  </script>
</%def>