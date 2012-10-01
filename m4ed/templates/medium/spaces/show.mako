<%inherit file="/medium/base.mako"/>

<%block name="title">m4ed - New Learning Space</%block>

<%block name="content">
  <div>
    <p><a href="/">Home</a></p>
    <p>Name: ${space.title}</p>
    <p>description: ${space.desc if hasattr(space, 'desc') else space.description}</p>
    ## <p><a href="${new_cluster_url}">New cluster</a></p>
    <p>Clusters</p>
    <ul>
    % for c in space.get('clusters', list()):
      <li><a href="/c/${str(c['_id'])}" >${c['title']}</a></li>
    % endfor
    </ul>
    <a href="/s/${str(space._id)}/edit">Edit space</a>
  </div>
</%block>
