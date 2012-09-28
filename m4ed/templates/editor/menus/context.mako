<%def name="context_item()">
  <div class="nav-collapse context-menu"> 
    <ul class="nav pull-right">
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

          <li><a href="#" class="action add"><i class="icon-plus"></i> Add new</a></li>
          <li class="disabled"><a href="#" class="action duplicate"><i class="icon-plus-sign"></i> Duplicate</a></li>
          <li>
            <a href="#" class="action toggle-deletion">
              <i class="icon-remove-sign"></i>
              <span class="effect">Enable</span> deletion
            </a>
          </li>
          <li class="disabled"><a href="#" class="access-control"><i class="icon-keys"></i> Access control</a></li>
          <li class="disabled"><a href="#" class="action on-off"><i class="icon-off"></i> Offline</a></li>

        </ul>
      </li>
    </ul>
  </div>
</%def>