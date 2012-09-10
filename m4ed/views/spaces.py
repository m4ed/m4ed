from pyramid.view import (
    view_config,
    view_defaults
    )

from pyramid.httpexceptions import HTTPFound
from pyramid.security import authenticated_userid
from m4ed.factories import SpaceFactory
from m4ed.util import filters


def valid_space(request):
    valid = True
    space = None
    message = ''
    title, description = valid_space_form(request)
    if not title:
        valid = False
        message = 'Invalid form data'
    else:
        title = filters.force_utf8(title)
        description = filters.force_utf8(description)
        # Check for uniqueness?
        space_factory = SpaceFactory(request)
        space = space_factory.save({
            'title': title,
            'description': description
            })
    return dict(
        valid=valid,
        space=space if space is not None else None,
        message=message
        )


def valid_space_form(request):
    try:
        title = request.params['title']
        desc = request.params['desc']
    except KeyError:
        return (False, False)
    return (title, desc)


@view_config(route_name='new_space', renderer='new_space.mako')
def new_space(request):
    next = request.params.get('next') or request.route_url('home')
    if not authenticated_userid(request):
        return HTTPFound(location=next)
    message = ''
    if 'form.submitted' in request.params:
        res = valid_space(request)
        if res['valid']:
            next = '/s/{}'.format(str(res['space']._id))
            return HTTPFound(location=next)
        message = res['message']

    return {'url': '', 'message': message}


@view_config(route_name='show_space', renderer='show_space.mako')
def show_space(request):
    return {
        'space': request.context
    }
