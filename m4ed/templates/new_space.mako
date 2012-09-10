<!DOCTYPE html>
<head>
  <%block name="head">
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="">
  <meta name="author" content="">
  <title>m4ed - New Learning Space</title>
</head>
<body>
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
</body>
</%block>