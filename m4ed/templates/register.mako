<!DOCTYPE html>
<head>
  <%block name="head">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">
    <title>m4ed - Registration</title>
</head>
<body>
    <b>Register</b><br/>
    <span>${message}</span>
    <form action="${url}" method="post">
      <input type="text" name="name" value=""/><br/>
      <input type="password" name="password"
             value=""/><br/>
      <input type="submit" name="form.submitted" value="Register"/>
    </form>
</body>
</%block>