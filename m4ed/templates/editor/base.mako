<%namespace file="menus/quick.mako" import="*"/>

<!DOCTYPE html>
<head>
  <%block name="head">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">
    <title><%block name="title">Testing</%block></title>

    <!-- Le HTML5 shim, for IE6-8 support of HTML5 elements -->
    <!--[if lt IE 9]>
      <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->

    <!-- Le fav and touch icons -->
    <link rel="shortcut icon" href="/fanstatic/m4ed/img/favicon.ico">
    <link rel="apple-touch-icon-precomposed" sizes="144x144" href="/fanstatic/m4ed/bootstrap/ico/apple-touch-icon-144-precomposed.png">
    <link rel="apple-touch-icon-precomposed" sizes="114x114" href="/fanstatic/m4ed/bootstrap/ico/apple-touch-icon-114-precomposed.png">
    <link rel="apple-touch-icon-precomposed" sizes="72x72" href="/fanstatic/m4ed/bootstrap/ico/apple-touch-icon-72-precomposed.png">
    <link rel="apple-touch-icon-precomposed" href="/fanstatic/m4ed/bootstrap/ico/apple-touch-icon-57-precomposed.png">

  </%block>
</head>
<body>

  <div class="navbar navbar-inverse navbar-fixed-top">
    <div class="navbar-inner">
      <div class="container">

        <a class="brand" href="/">m4ed</a>

        <a class="btn btn-navbar btn-large-icon" data-toggle="collapse" data-target=".nav-collapse.context-menu">
          <i class="icon-quick large"></i> 
        </a>

        <a class="btn btn-navbar btn-large-icon" data-toggle="collapse" data-target=".nav-collapse.quick-menu">
          <i class="icon-quick large"></i> 
        </a>

        ${quick_menu()}

        <%block name="context_menu">
        </%block>

      </div>
    </div>
  </div>

  <div class="container">
    <%block name="content">
    </%block>
  </div>

  <!-- Le javascript
  ================================================== -->
  <!-- Placed at the end of the document so the pages load faster -->

  <script src="/fanstatic/m4ed/js/lib/requirejs/require.js"></script>

  <%block name="scripts">
  </%block>

</body>
