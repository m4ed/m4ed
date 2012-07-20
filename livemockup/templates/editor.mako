<%inherit file="base.mako"/>

<%block name="head">
  ${parent.head()}

<!--     <link href="../assets/css/editor.css" rel="stylesheet"> -->

<!--     <link href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.18/themes/base/jquery-ui.css" rel="stylesheet" type="text/css"/>
  <link rel="stylesheet" type="text/css" href="${request.static_url('livemockup:static/wysiwym/wysiwym.css')}" />
  <link rel="stylesheet" href="${request.static_url('livemockup:static/style/editor.css')}" />


  <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
  <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.18/jquery-ui.min.js"></script>


  <script src="${request.static_url('livemockup:static/scripts/underscore-min.js')}"></script>
  <script src="${request.static_url('livemockup:static/scripts/jquery.autoellipsis-1.0.4.min.js')}"></script>
  <script src="${request.static_url('livemockup:static/wysiwym/wysiwym.js')}"></script>

  <script src="${request.static_url('livemockup:static/scripts/editor.js')}"></script>
 -->
  <%block name="title">Content editor mockup</%block>

</%block>

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
  

</%block>

<%def name="hogan_editor()">
  <div class="row">
    <div class="span6">
      <div class="btn-group editor-buttons">
      </div>
      <textarea class="span6 editor-textarea">{{text}}</textarea>
    </div>
    <div class="span6">
      <div class="btn-group editor-buttons preview-buttons">
        <button class="btn">Desktop</button>
        <button class="btn">Tablet</button>
        <button class="btn">Smartphone</button>
        <button class="btn">Feature phone</button>
      </div>
      <div class="preview"></div>
    </div>
  </div>
  
  <div id="editor-controls">
    <button class="btn btn-primary editor-btn">Save</button>
    <button class="btn editor-btn cancel">Cancel</button>
    <button class="btn editor-btn pictures">Pictures</button>
  </div>
    <div id="editor-pictures">
      <div class="picture-container">
        <img class="picture" id="add-picture" />
      </div>
  </div>
</%def>


