<%inherit file="base.mako"/>

<%block name="title">Content editor mockup</%block>


<%block name="content">
  <% temporary_exercise_counter = 100 %>
  % for i, lesson in enumerate(lessons):
    <div class="well item lesson" data-id="${i+1}">
      <div class="item-icon">
        <img src="http://placehold.it/48x48" />
      </div>
      <div class="item-content">
        <h4 class="title">
          <span class="view">${lesson.get('title')}</span>
          <input type="text" class="edit" value="${lesson.get('title')}" data-attr="title"/>
        </h4>
        <p class="desc">
          <span class="view">${lesson.get('description')}</span>
          <input type="text" class="edit" value="${lesson.get('description')}" data-attr="description"/>
        </p>
      </div>
    </div>
    % for exercise in lesson.get('exercises'):
      <% temporary_exercise_counter += 1 %>
      <div class="well item exercise" data-id="${temporary_exercise_counter}">
        <div class="item-icon">
          <img src="http://placehold.it/48x48" />
        </div>
        <div class="item-content">
          <h4 class="title">${exercise}</h4>
          <p class="desc">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc enim risus, rhoncus in aliquet sit amet, pellentesque id enim. In hac habitasse platea dictumst. </p>
        </div>
      </div>
    % endfor
  % endfor
  <script id="editor-template" type="text/hogan">
    ${hogan_editor()}
  </script>
  ${hogan_wysiwym()}
  ${hogan_wysiwym_button()}
  

</%block>

<%def name="hogan_editor()">
  <div class="row">
    <div class="span6 editor-wrap">
      <div class="btn-toolbar editor-buttons">
      </div>
      <textarea class="span6 editor-textarea">{{text}}</textarea>
    </div>
    <div class="span6">
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
  
  <div class="editor-controls">
    <button class="btn btn-primary editor-btn">Save</button>
    <button class="btn editor-btn cancel">Cancel</button>
    <button class="btn editor-btn pictures">Pictures</button>
  </div>
    <div class="editor-pictures">
      <div class="asset-container">
      </div>
  </div>
</%def>

<%def name="hogan_wysiwym()">
  <script id="wysiwym-editor-template" type="text/hogan">
  <div class="{{editorclass}}">
    <div class="{{containerclass}}">
    {{#groups}}
      <div class="btn-group">
        {{#buttons}}
        {{#buttonwrap}}
          <div class="button btn {{buttonclass}}" unselectable="on">
            <span class="wrap" unselectable="on">
              <span class="text" style="display:{{display}}" unselectable="on">{{name}}</span>
              <i class="icon-{{icon}}"></i>
            </span>
          </div>
        {{/buttonwrap}}
        {{/buttons}}
      </div>
    {{/groups}}
    </div>
    {{textarea}}
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