from pyramid.view import (
    view_config,
    forbidden_view_config
    )
from pyramid.httpexceptions import HTTPFound
from pyramid.security import (
    remember,
    forget,
    authenticated_userid
    )

from m4ed.factories import UserFactory

import bcrypt


def valid_login(request):
    user_factory = UserFactory(request)
    user = user_factory.login()
    if not user:
        return False
    return user


@view_config(route_name='login', renderer='medium/auth/login.mako')
#@forbidden_view_config(renderer='medium/auth/login.mako')
def login(request):
    next = request.params.get('next') or request.route_url('index')
    if authenticated_userid(request):
        return HTTPFound(location=next)
    name = ''
    password = ''
    message = ''
    if 'form.submitted' in request.params:
        user = valid_login(request)
        if user:
            headers = remember(request, user.name)
            return HTTPFound(location=next, headers=headers)
        else:
            message = 'invalid password'

    return dict(
        message=message,
        url='/login',
        name=name,
        password=password
        )


def valid_registration(request):
    message = ''

    user_factory = UserFactory(request)
    result = user_factory.create()

    if result['success'] is False:
        message = result['message']
        data = result['data']
        return (dict(name=data['name'], email=data['email']), message)
    else:
        user = result['user']
        return (user, message)


@view_config(route_name='register', renderer='medium/auth/register.mako')
def register(request):
    next = request.params.get('next') or request.route_url('editor')
    if authenticated_userid(request):
        return HTTPFound(location=next)

    message = ''
    name = ''
    email = ''
    if 'form.submitted' in request.params:
        user, message = valid_registration(request)
        try:
            headers = remember(request, str(user.name))
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
            name = user.get('name')
            email = user.get('email')

    return dict(
        url=request.route_url('register'),
        message=message,
        name=name,
        email=email
    )


@view_config(route_name='logout')
def logout(request):
    headers = forget(request)
    return HTTPFound(location='/', headers=headers)
