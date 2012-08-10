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
    <link rel="shortcut icon" href="/fanstatic/m4ed/bootstrap/ico/favicon.ico">
    <link rel="apple-touch-icon-precomposed" sizes="144x144" href="/fanstatic/m4ed/bootstrap/ico/apple-touch-icon-144-precomposed.png">
    <link rel="apple-touch-icon-precomposed" sizes="114x114" href="/fanstatic/m4ed/bootstrap/ico/apple-touch-icon-114-precomposed.png">
    <link rel="apple-touch-icon-precomposed" sizes="72x72" href="/fanstatic/m4ed/bootstrap/ico/apple-touch-icon-72-precomposed.png">
    <link rel="apple-touch-icon-precomposed" href="/fanstatic/m4ed/bootstrap/ico/apple-touch-icon-57-precomposed.png">

  </%block>
</head>
<body>

  <%block name="navigation">
    <div class="navbar navbar-fixed-top">
      <div class="navbar-inner">
        <div class="container">

          <a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </a>

          <a class="brand" href="/">m4ed</a>

          <div class="nav-collapse">



            <ul class="nav">
              <li class="dropdown">
                <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                  Quick menu <b class="caret"></b>
                </a>
                <ul class="dropdown-menu">
                  <li class="nav-header"><i class="icon-history"></i> Recently viewed</li>
                  <li><a href="#">Learning space 3</a></li>
                  <li><a href="#">Collection 4</a></li>
                  <li><a href="#">Collection 1</a></li>
                  <li class="nav-header"><i class="icon-star"></i> Favorites</li>
                  <li><a href="#">Learning space 1</a></li>
                  <li><a href="#">Collection 2</a></li>
                </ul>
              </li>

        <!-- <li class="dropdown">
              <a href="#" class="dropdown-toggle" data-toggle="dropdown"><i class="icon-white icon-plus"></i> </a>
                  <ul class="dropdown-menu">
                  <li><a href="#">Add to top</a></li>
                  <li><a href="#">Add to bottom</a></li>
                </ul>
              </li> -->

            </ul>

            <ul class="nav pull-right">
              <li class="dropdown">
                <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                  Context menu <b class="caret"></b>
                </a>
                <ul class="dropdown-menu">
                  <li class="nav-header">Actions</li>
                  <li><a href="#"><i class="icon-plus"></i> Add new</a></li>
                  <li><a href="#" class="toggle-modal-upload"><i class="icon-upload"></i> Upload files</a></li>
                  <li class="nav-header">Management</li>
                  <li><a href="#"><i class="icon-group"></i> Users</a></li>
                  <li><a href="#"><i class="icon-chart"></i> Statistics</a></li>
                  <li class="nav-header">User account</li>
                  <li><a href="#"><i class="icon-user"></i> Profile</a></li>
                  <li><a href="#"><i class="icon-cog"></i> Settings</a></li>
                  <li><a href="#"><i class="icon-off"></i> Logout</a></li>
                  <li class="divider"></li>
                  <li><a href="#"><i class="icon-flag"></i> Help</a></li>
                </ul>
              </li>
            </ul>

          </div>


          
        </div>
      </div>
    </div>





  </%block>

  <div class="container">
    <%block name="content">
    </%block>
  </div>

  <!-- Le javascript
  ================================================== -->
  <!-- Placed at the end of the document so the pages load faster -->

  <script data-main="/fanstatic/m4ed/js/main.js" src="/fanstatic/m4ed/js/lib/requirejs/require.js"></script>

</body>
