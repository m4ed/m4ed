<!DOCTYPE html>
<head>
  <%block name="head">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">
    <title>m4ed - Login Dummy</title>
</head>
<body>
    <b>Login</b><br/>
    <span>${message}</span>
    <form action="${post_url}" method="post">
      <input type="text" name="username" value="${username}"/><br/>
      <input type="password" name="password"
             value="${password}"/><br/>
      <input type="submit" name="form.submitted" value="Log In"/>
      <input type="hidden" name="next" value="${next}"/>
    </form>
</body>
</%block>