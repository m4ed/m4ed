from pyramid.view import (
    view_config,
    forbidden_view_config
    )
from pyramid.httpexceptions import (
    HTTPFound,
    HTTPNotAcceptable
    )
from pyramid.security import (
    remember,
    forget,
    authenticated_userid
    )

from m4ed.resources import login_less

import logging

log = logging.getLogger(__name__)


def valid_login(request):
    # Request context should be m4ed.factories.UserFactory at this point
    user = request.context.login()
    print "-" * 20 + " valid_login:"
    print user
    if not user:
        return False
    return user


@view_config(route_name='login', renderer='auth/login.mako')
#@forbidden_view_config(renderer='medium/auth/login.mako')
def login(request):

    login_less.need()

    next = request.params.get('next') or request.route_url('index')
    if authenticated_userid(request):
        return HTTPFound(location=next)
    username = ''
    password = ''
    message = ''
    if 'form.submitted' in request.params:
        user = valid_login(request)
        if user:
            headers = remember(request, user.username)
            return HTTPFound(location=next, headers=headers)
        else:
            message = 'Invalid password.'

    return dict(
        next=next,
        login_error=message,
        login_url=request.route_url('login'),
        register_url=request.route_url('register'),
        username=username,
        password=password
        )


def valid_registration(request):
    message = ''

    # Request context should be m4ed.factories.UserFactory at this point
    result = request.context.create_user()

    if result['success'] is False:
        message = result['message']
        log.debug('{0} Failed to register: {1}'.format(
            request.remote_addr, message))
        data = result['data']
        if data:
            return (dict(
                username=data['username'],
                email=data['email']
                ), message)
        else:
            return (None, message)
    else:
        user = result['user']
        return (user, message)


@view_config(route_name='rest_signup', request_method='POST', renderer='json')
def post_signup(request):

    message = ''
    user, message = valid_registration(request)

    if message == '' and user:
        headers = remember(request, user['username'])
        request.response.status = '200'
        request.response.headerlist.extend(headers)
        return {}
    else:
        request.response.status = '500'
        return {'message': message}


@view_config(route_name='rest_login', request_method='POST', renderer='json')
def post_login(request):

    user = valid_login(request)

    if user:
        headers = remember(request, user['username'])
        request.response.status = '200'
        request.response.headerlist.extend(headers)
        return {}
    else:
        request.response.status = '500'
        return {'message': 'Login failed. Please check your username and password.'}


@view_config(route_name='register')
def register(request):
    next = request.params.get('next') or request.route_url('index')
    if request.method == 'GET' or authenticated_userid(request):
        return HTTPFound(location=next)

    message = ''
    username = ''
    email = ''
    if 'form.submitted' in request.params:
        user, message = valid_registration(request)
        try:
            headers = remember(request, str(user.username))
            #if 'csrf_token' not in request.cookies.keys():
            # request.response.set_cookie(
            #     'csrftoken',
            #     value=request.session.get_csrf_token(),
            #     overwrite=True
            # )
            # TODO: Ensure that this doesn't happen --v--
            #str_headers = []
            # Stupid fix to remove unicode values in header
            # that something seems to generate
            # for header in headers:
            #     try:
            #         k, v = header
            #         if isinstance(v, unicode):
            #             str_headers.append((k, str(v)))
            #         else:
            #             str_headers.append((k, v))
            #     except ValueError:
            #         continue

            return HTTPFound(location=next, headers=headers)
        except AttributeError:
            username = user.get('username')
            email = user.get('email')

    return HTTPFound(location=next)

    # return dict(
    #     url=request.route_url('register'),
    #     message=message,
    #     username=username,
    #     email=email
    # )


@view_config(route_name='logout')
def logout(request):
    next = request.params.get('next') or request.route_url('index')
    if not authenticated_userid(request):
        return HTTPFound(location=request.route_url('login'))
    headers = forget(request)
    response = HTTPFound(location=next, headers=headers)
    response.set_cookie('csrf_token', value=None)
    return response
