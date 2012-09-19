<!DOCTYPE html>
<head>
  <title>Index</title>
</head>
<body>
  % if not authenticated:
  <p><a href="/login">Login</a></p>
  % else:
  <p><a href="/logout">Logout</a></p>
  % endif
  <p><a href="/spaces/create">New space</a></p>
  <ul>
  % for s in spaces:
    <li><a href="/s/${str(s._id)}" >${s.title}</a></li>
  % endfor
  </ul>
</body>