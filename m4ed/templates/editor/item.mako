## Template for items in editor view

<%def name="item_template(title, desc, icon)">
  <div class="well item">
    <div class="item-icon">
      <img src="${icon}" />
    </div>
    <div class="handle">
    </div>
    <div class="item-content">
      <h5 class="title">
        <span class="view">${title}</span>
        <input type="text" class="edit" value="${title}" data-attr="title" maxlength="160"/>
      </h5>
      <p class="desc">
        <span class="view">${desc}</span>
        <input type="text" class="edit" value="${desc}" data-attr="desc" maxlength="160"/>
      </p>
    </div>
  </div>
</%def>