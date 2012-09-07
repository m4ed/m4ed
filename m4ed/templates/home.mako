<!DOCTYPE html>
<head>
  <%block name="head">
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="">
  <meta name="author" content="">
  <title>m4ed - Home</title>
  <script data-main="/fanstatic/m4ed/js/student_main.js" src="/fanstatic/m4ed/js/lib/requirejs/require.js"></script>
</head>
<body>
  <style>
    .green { color: green; }
    .red { color: red; }
  </style>
  <div>
    <div class="container" id="content">${html|n}</div>
  </div>
</body>
</%block>