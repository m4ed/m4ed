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
    <form action="${url}" method="post"/>
      <div><label for="name">Name</label></div>
      <input type="text" name="name" value="${name}"/>
      <div><label for="pw1">Password</label></div>
      <input type="password" name="pw1" value=""/>
      <div><label for="pw2">Confirm password</label></div>
      <input type="password" name="pw2" value=""/>
      <div><label for="email">Email (optional)</label></div>
      <input type="email" name="email" value="${email}"/>
      <div></div>
      <input type="submit" name="form.submitted" value="Register"/>
    </form>
</body>
</%block>