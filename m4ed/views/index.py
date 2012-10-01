from m4ed.resources import editor_less
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
    renderer='medium/index.mako')
def get_index(request):
    return {
        'login_url': request.route_url('login'),
        'logout_url': request.route_url('logout'),
        'register_url': request.route_url('register'),
        # 'new_space_url': request.route_url('new_space'),
        'authenticated': authenticated_userid(request),
        'spaces': request.context
    }
