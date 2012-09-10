
from pyramid.view import view_config

from m4ed.resources import editor_less


@view_config(route_name='exercise', renderer='home.mako')
def get_exercise(request):
    editor_less.need()

    try:
        html = request.context.html
    except AttributeError:
        html = ''
    return {
        'item_id': str(request.context._id),
        'html': html
    }
