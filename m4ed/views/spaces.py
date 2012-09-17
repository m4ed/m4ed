from pyramid.view import (
    view_config,
    view_defaults
    )

from pyramid.httpexceptions import HTTPFound
from pyramid.security import authenticated_userid
from m4ed.factories import SpaceFactory


def valid_space(request):
    valid = False
    space = None
    message = 'Invalid form data'

    space_factory = SpaceFactory(request)
    space = space_factory.create()

    if space is not None:
        valid = True
        message = ''

    return dict(
        valid=valid,
        space=space if space is not None else None,
        message=message
        )


@view_config(route_name='new_space', renderer='medium/spaces/new.mako', permission='write')
def new_space(request):
    next = request.params.get('next') or request.route_url('index')
    if not authenticated_userid(request):
        return HTTPFound(location=next)
    message = ''
    if 'form.submitted' in request.params:
        res = valid_space(request)
        if res['valid']:
            next = request.route_url('show_space',
                                     space_id=str(res['space']._id))
            return HTTPFound(location=next)
        message = res['message']

    return {'url': '', 'message': message}


@view_config(route_name='show_space', renderer='medium/spaces/show.mako', permission='read')
def show_space(request):
    return {
        'new_cluster_url': request.route_url('new_cluster', space_id=request.matchdict['space_id']),
        'space': request.context
    }
