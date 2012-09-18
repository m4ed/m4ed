
from pyramid.view import view_config


@view_config(route_name='index', renderer='medium/index.mako')
def get_spaces(request):
    print request.context
    return {
        'spaces': request.context
    }
