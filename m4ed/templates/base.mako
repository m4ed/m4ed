<!DOCTYPE html>
<head>
  <%block name="head">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">
    <title><%block name="title">m4ed</%block></title>

    <!-- Le HTML5 shim, for IE6-8 support of HTML5 elements -->
    <!--[if lt IE 9]>
      <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->

    <%block name="icons">
    </%block>

    <script src="/fanstatic/m4ed/js/lib/requirejs/require.js"></script>
    <%block name="require_config">
      <script src="/fanstatic/m4ed/js/student/config.js"></script>
    </%block>
  </%block>
</head>
<body>

  <div class="navbar navbar-inverse navbar-fixed-top">
    <div class="navbar-inner">
      <div class="container">

        <a class="brand" href="/">m4ed</a>

        <%block name="menus">
        </%block>

      </div>
    </div>
  </div>

  <div class="container">
    <%block name="content">
    </%block>
    <%block name="footer">
    </%block>
  </div>

  <!-- Le javascript
  ================================================== -->
  <!-- Placed at the end of the document so the pages load faster -->

  <%block name="scripts">
  </%block>

</body>
