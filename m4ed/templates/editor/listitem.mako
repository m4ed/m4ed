## Template for items in editor views

<%def name="item_template(title, desc, icon, tags)">
  <div class="well item">

    <div class="btn btn-inverse btn-circle btn-remove" style="display: none;">
      <i class="icon-remove icon-white"></i>
    </div>

    <div class="item-icon">
      <img src="${icon}" alt="item" />
    </div>
    <div class="handle">
    </div>

    <div class="item-content">
      <div class="title">
        <span class="view">${title}</span>
        <input type="text" class="edit" value="${title}" data-attr="title" maxlength="160">
      </div>
      <div class="desc">
        <span class="view">${desc}</span>
        <input type="text" class="edit" value="${desc}" data-attr="desc" maxlength="160">
      </div>
      <input class="tags" type="text" placeholder="Add tags…">
    </div>
  </div>
</%def>