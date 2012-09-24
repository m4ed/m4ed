<!DOCTYPE html>
<head>
  <title>Index</title>
</head>
<body>
  % if not authenticated:
  <p><a href="${login_url}">Login</a></p>
  <p><a href="${register_url}">Register</a></p>
  % else:
  <p><a href="${logout_url}">Logout</a></p>
  % endif
  <p><a href="${new_space_url}">New space</a></p>
  <ul>
  % for s in spaces:
    <li><a href="/s/${str(s._id)}" >${s.title}</a></li>
  % endfor
  </ul>
</body>