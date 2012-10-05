## Template for items in student views

<%def name="item_template(url, title, desc, icon)">
  <a class="well item" href='${url}'>

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

      </div>
      <div class="desc">
        <span class="view">${desc}</span>

      </div>
    </div>
  </a>
</%def>