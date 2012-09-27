from m4ed.models import User

from pyramid.events import (
    ContextFound,
    NewRequest,
    subscriber
    )

from pyramid.httpexceptions import HTTPUnauthorized

def groupfinder(userid, request, debug=False):
    #print 'X' * 100
    #print request.context
    user = request.user
    groups = []
    if user is not None:
        # Every user belongs to group which is their user name
        # prefixed with g:
        groups.append('g:{}'.format(user.username))
        user_groups = user.groups
        if isinstance(user_groups, list):
            for g in user_groups:
                groups.append('g:{}'.format(g))
        elif isinstance(user_groups, basestring):
            # If it's a string (which it never should be)
            # assume it's just the name of one group
            groups.append('g:' + user_groups)

        if debug:  # pragma: no cover
            print 'THESE ARE THE GROUPS GROUPFINDER FOUND'
            print groups
    return groups


@subscriber(ContextFound)
def csrf_validation_event(event):
    request = event.request
    # No need to check csrf for anything else but POST, PUT and DELETE
    if request.method not in ('POST', 'PUT', 'DELETE'):
        if 'csrf_token' not in request.cookies.keys():
            request.response.set_cookie(
                'csrf_token',
                value=request.session.get_csrf_token(),
                overwrite=True
            )
        return
    print '\n\nWE ARE CHECKING CSRF SINCE THIS WAS A POST, PUT OR DELETE\n'
    user = request.user
    supplied_csrf = (request.params.get('csrf_token') or
                     request.headers.get('X-Csrftoken'))
    session_csrf = request.session.get_csrf_token()
    print 'User:', user
    print 'supplied csrf token:', supplied_csrf
    print 'session  csrf token:', session_csrf
    print 'Request headers:', str(request.headers.keys())
    print '\n\n'
    if user and supplied_csrf != session_csrf:
        # If for some reason the crsf token provided and the one contained
        # in session don't match, generate a new token and raise 401
        request.session.new_csrf_token()
        request.response.set_cookie('csrf_token', value=None)
        raise HTTPUnauthorized
