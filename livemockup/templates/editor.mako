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

<%block name="scripts">

  ${parent.scripts()}

  <script src="/fanstatic/livemockup/js/wysiwym.js"></script>
  <script src="/fanstatic/livemockup/js/underscore-min.js"></script>

  <script src="/fanstatic/livemockup/js/editor.js"></script>

</%block>

<%block name="content">

  % for i, lesson in enumerate(lessons):
    <div class="well item lesson">
      <div class="item-icon">
        <img src="http://placehold.it/48x48" />
      </div>
      <div class="item-content">
        <h4 class="title">${lesson.get('title')}</h4>
        <p class="desc">Description of this lesson...</p>
      </div>
      % if i == 1:
        ${editor()}
      % endif
    </div>
    % for exercise in lesson.get('exercises'):        
      <div class="well item exercise">
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
  
</%block>

<%def name="editor()">

  <div id="editor">

    <div class="row">
      <div class="span6">
        <div class="btn-group editor-buttons">
        </div>
        <textarea class="span6 editor-textarea"></textarea>
      </div>
      <div class="span6">
        <div id="preview-buttons" class="btn-group">
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
<!--       <div id="pointing-arrow">
        <img src="${request.static_url('livemockup:static/graphics/white_arrow.png')}" />
      </div> -->
      <div class="picture-container">
        % for i in range(0,6):
          <img class="picture" src="http://placehold.it/150x100" />
        % endfor
        <img class="picture" id="add-picture" />
      </div>
    </div>
  </div>

</%def>

<%def name="controls()">
  
  <div class="item-controls">
    <a href="#" class="control-button edit">
      <img src="${request.static_url('livemockup:static/icons/32x32/file-edit.png')}" />
    </a>
    <a href="#" class="control-button preview">
      <img src="${request.static_url('livemockup:static/icons/32x32/view.png')}" />
    </a>
    <a href="#" class="control-button delete">
      <img src="${request.static_url('livemockup:static/icons/32x32/delete.png')}" />
    </a>
  </div>
</%def>