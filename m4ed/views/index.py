
from pyramid.view import view_config
from pyramid.security import authenticated_userid


@view_config(route_name='index', renderer='medium/index.mako')
def get_spaces(request):
    print request.context
    return {
        'authenticated': authenticated_userid(request),
        'spaces': request.context
    }
