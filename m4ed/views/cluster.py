from pyramid.view import (
    view_config,
    view_defaults
    )

from m4ed.resources import editor_less
from pyramid.httpexceptions import HTTPFound
from pyramid.security import authenticated_userid


@view_config(
    route_name='edit_cluster',
    renderer='editor/cluster.mako',
    permission='write')
def get_edit_cluster(request):
    editor_less.need()
    return {
        'cluster': request.context.stripped
    }


@view_config(
    route_name='cluster',
    renderer='medium/clusters/show.mako',
    permission='read')
def get_cluster(request):
    return {
        'cluster': request.context.stripped
    }
