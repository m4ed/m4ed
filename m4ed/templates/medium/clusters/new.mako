<%inherit file="/medium/base.mako"/>

<%block name="title">m4ed - New Cluster</%block>

<%block name="content">
  <div>
    <div>
      ${message}
    </div>
    <form action="${url}" method="post"/>
      <div><label for="title">Title</label></div>
      <input type="text" name="title" value=""/>
      <div><label for="desc">Description</label></div>
      <input type="text" name="desc" value=""/>
      <div></div>
      <input type="submit" name="form.submitted" value="Create"/>
    </form>
  </div>
</%block>
