<%def name="hogan_multiplechoice()">

  <script id="legend-template" type="text/hogan">
    <ul class="legend">
    {{#choices}}
      <li>
        <span class="label label-info prefix">{{prefix}}</span>
        {{& html}}
      </li>
    {{/choices}}
    </ul>
  </script>

  <script id="answerbuttons" type="text/hogan">
    <div>
      {{#choices}}
        <div class="btn-wrapper {{btn_wrapper_class}}" style="width: {{btn_width}};" >
          <button class="btn btn-answer {{btn_class}}" data-id="{{id}}">
            {{#show_prefix}}
              <span class="prefix {{prefix_class}}">{{prefix}}</span>
            {{/show_prefix}}
            {{#show_content}}
              <span class="content">{{& html}}</span>
            {{/show_content}}
          </button>
        </div>
      {{/choices}}
    </div>
  </script>

  <script id="alert-template" type="text/hogan">
    <div class="alert alert-{{alert_class}} answer-alert">
      <button type="button" class="close" data-dismiss="alert">×</button>
      {{& alert }}
    </div>
  </script>
  
</%def>