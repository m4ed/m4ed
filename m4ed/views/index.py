
from pyramid.view import view_config
from pyramid.security import authenticated_userid


@view_config(route_name='index', renderer='medium/index.mako')
@view_config(route_name='edit_index', renderer='editor/index.mako')
def get_spaces(request):
    print request.context
    return {
        'login_url': request.route_url('login'),
        'logout_url': request.route_url('logout'),
        'register_url': request.route_url('register'),
        # 'new_space_url': request.route_url('new_space'),
        'authenticated': authenticated_userid(request),
        'spaces': request.context
    }
