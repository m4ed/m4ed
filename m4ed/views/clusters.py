from pyramid.view import (
    view_config,
    view_defaults
    )

from pyramid.httpexceptions import HTTPFound
from pyramid.security import authenticated_userid


def valid_cluster(request):
    valid = False
    cluster = None
    message = 'Invalid cluster data'

    # The request context at this point should be m4ed.models.Space
    cluster = request.context.create_cluster()
    if cluster is not None:
        message = ''
        valid = True

    return dict(
        valid=valid,
        cluster=cluster if cluster is not None else None,
        message=message
        )


@view_config(
    route_name='new_cluster',
    renderer='medium/clusters/new.mako',
    permission='write'
    )
def new_cluster(request):
    next = request.params.get('next') or request.route_url('index')
    if not authenticated_userid(request):
        return HTTPFound(location=next)
    message = ''
    if 'form.submitted' in request.params:
        res = valid_cluster(request)
        if res['cluster'] is not None:
            next = request.route_url('show_cluster',
                                     cluster_id=str(res['cluster']._id))
            return HTTPFound(location=next)
        message = res['message']

    return {'url': '', 'message': message}


@view_config(
    route_name='show_cluster',
    renderer='medium/clusters/show.mako',
    permission='read')
def show_cluster(request):
    return {
        'cluster': request.context
    }
