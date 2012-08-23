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