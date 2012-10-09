<%def name="hogan_multiplechoice()">
  <script id="multiplechoice-template" type="text/hogan">
    {{#choices}}
    <div class="span3">
      <div>
        <button class="btn btn-primary" data-id="{{id}}">
          {{prefix}}
        </button>
        <span>
           {{! & to unescape the text data }}
           {{& html}}
        </span>
        <div class="hint {{hint_class}} hide">
          <p>{{& hint }}</p>
        </div>
      </div>
    </div>
    {{/choices}}
  </script>
</%def>