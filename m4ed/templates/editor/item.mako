## Template for items in editor view

<%def name="item_template(title, desc, icon, tags)">
  <div class="well item" data-tags="${tags}">
    <div class="item-icon">
      <img src="${icon}" />
    </div>
    <div class="handle">
    </div>
<!--     <div class="btn btn-small btn-primary publish">
      Publish changes
    </div> -->

    <div class="btn-group item-actions pull-right">
      <button class="btn btn-primary">Publish changes</button>
      <button class="btn btn-primary dropdown-toggle" data-toggle="dropdown">
        <span class="caret"></span>
      </button>
      <ul class="dropdown-menu">
        <li><a href="#"><i class="icon-undo"></i> Revert to original</a></li>
      </ul>
    </div>

    <div class="item-content">
      <div class="title">
        <span class="view">${title}</span>
        <input type="text" class="edit" value="${title}" data-attr="title" maxlength="160"/>
      </div>
      <div class="desc">
        <span class="view">${desc}</span>
        <input type="text" class="edit" value="${desc}" data-attr="desc" maxlength="160"/>
      </div>
      <input class="tags" type="text" placeholder="Add tags…"></input>
    </div>
  </div>
</%def>