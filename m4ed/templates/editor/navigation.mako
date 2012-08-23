<%def name="navigation()">
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
          </ul>

          <ul class="nav pull-right">
            <li class="dropdown">
              <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                Context menu <b class="caret"></b>
              </a>
              <ul class="dropdown-menu">
                <li class="nav-header">Actions</li>
                <li><a href="#" class="action add"><i class="icon-plus"></i> Add new</a></li>
                <li><a href="#" class="toggle-modal-upload" data-target="#modal-upload" data-toggle="modal"><i class="icon-upload"></i> Upload files</a></li>
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
</%def>