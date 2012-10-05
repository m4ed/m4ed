from m4ed.resources import (
    editor_less,
    student_less
    )

from pyramid.httpexceptions import HTTPFound
from pyramid.view import view_config
from pyramid.security import authenticated_userid


@view_config(
    route_name='edit_index',
    renderer='editor/index.mako',
    permission='write')
def get_edit_index(request):
    editor_less.need()
    spaces_array = []
    for space in request.context:
        spaces_array.append(space)

    return {
        'spaces': request.context,
        'spaces_array': spaces_array
    }


@view_config(
    route_name='index',
    renderer='student/index.mako')
def get_index(request):
    student_less.need()

    authenticated = authenticated_userid(request)

    if not authenticated:
        return HTTPFound(location=request.route_url('login'))

    return {
        'logout_url': request.route_url('logout'),
        'spaces': request.context
    }
