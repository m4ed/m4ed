<%def name="context_menu(edit_class='edit-mode', edit_href='#')">

  <a class="btn btn-navbar btn-large-icon" data-toggle="collapse" data-target=".nav-collapse.context-menu">
    <i class="icon-quick large"></i> 
  </a>

  <div class="nav-collapse context-menu"> 
    <ul class="nav pull-right">
      <li><a class="${edit_class}" href="${edit_href}">Edit mode</a></li>
      <li class="dropdown">
        <a href="#" class="dropdown-toggle" data-toggle="dropdown">
          Context menu <b class="caret"></b>
        </a>
        <ul class="dropdown-menu">
          <li class="disabled">
            <a href="#" class="profile">
              <div class="avatar">
              </div>
              <div class="info">
                <div class="user-name">
                  User Name
                </div>
                <div class="desc">
                  View my profile page
                </div>
              </div>
            </a>
          </li>

          <li class="divider"></li>
          <li class="disabled"><a href="#" class="logout"><i class="icon-envelope"></i> Messages</a></li>
          <li><a href="/logout" class="logout"><i class="icon-off"></i> Logout</a></li>

        </ul>
      </li>
    </ul>
  </div>
</%def>

<%def name="quick_menu()">

  <a class="btn btn-navbar btn-large-icon" data-toggle="collapse" data-target=".nav-collapse.quick-menu">
    <i class="icon-quick large"></i> 
  </a>

  <div class="nav-collapse quick-menu"> 
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
  </div>
</%def>