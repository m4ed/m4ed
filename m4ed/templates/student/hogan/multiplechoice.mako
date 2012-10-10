<%def name="hogan_multiplechoice()">
  <script id="multiplechoice-template" type="text/hogan">
    {{#choices}}
      <div>
        <span class="label label-info">{{prefix}}</span>
        {{& html}}
      </div>
    {{/choices}}

    <table style="width: 100%;">
      <tr>
      {{#choices}}
        <td style="width: 20%;">
          <button class="btn btn-primary btn-block" data-id="{{id}}">
            <h2>{{prefix}}</h2>
          </button>
        </td>
      {{/choices}}
      </tr>
    </table>
  </script>

  <script id="alert-template" type="text/hogan">
    <div class="hint alert alert-{{alert_class}}">
      <button type="button" class="close" data-dismiss="alert">×</button>
      {{& alert }}
    </div>
  </script>
</%def>