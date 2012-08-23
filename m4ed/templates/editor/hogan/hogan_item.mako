## Hogan template for item (needed on add)

<%namespace file="../item.mako" import="*"/>

<%def name="hogan_item()">
  <script id="item-template" type="text/hogan">
	${item_template('{{title}}', '{{desc}}', '/fanstatic/m4ed/img/48x48.gif')}
  </script>
</%def>