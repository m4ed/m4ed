<!DOCTYPE html>
<head>
  <title>Index</title>
</head>
<body>
  <p><a href="/spaces/create">New space</a></p>
  <ul>
  % for s in spaces:
    <li><a href="/s/${str(s._id)}" >${s.title}</a></li>
  % endfor
  </ul>
</body>