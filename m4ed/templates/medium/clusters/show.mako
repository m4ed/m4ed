<%inherit file="/medium/base.mako"/>

<%block name="title">m4ed - Cluster of stuff - ${cluster.title}</%block>

<%block name="content">
  <div>
    <a href="/s/${str(cluster.space_id)}">Parent</a>
    <h3>${cluster.title}</h3>
    <p>Description:</p>
    <p>${cluster.desc if hasattr(cluster, 'desc') else cluster.description}</p>
    <p>Items</p>
    <ul>
    % for c in cluster.get('items', list()):
      <li><a href="/i/${str(c._id)}" >${c.title}</a></li>
    % endfor
    </ul>
  </div>
</%block>
