from pyramid.view import view_config
from pyramid.httpexceptions import HTTPFound
from pyramid.security import (
    remember,
    forget,
    authenticated_userid
    )

from m4ed.util import constant_time_compare
from m4ed.util.filters import force_utf8
from m4ed.models import User


import bcrypt


@view_config(route_name='login', renderer='login.mako')
#@forbidden_view_config(renderer='login.mako')
def login(request):
    #print request.session
    next = request.params.get('next') or request.route_url('editor')
    if authenticated_userid(request):
        return HTTPFound(location=next)
    name = ''
    password = ''
    message = ''
    if 'form.submitted' in request.params:
        try:
            name = request.params['name']
            password = request.params['password']
        except AttributeError:
            message = 'Failed'
        else:
            password = force_utf8(password)
            user = User(request.db.users.find_one({'name': name}))
            try:
                expected_hash = bcrypt.hashpw(password, user.password)
                if constant_time_compare(user.password, expected_hash):
                    headers = remember(request, name)
                    return HTTPFound(location='/', headers=headers)
            except AttributeError:
                # When the user has no password
                message = 'Failed'

    return dict(
        message=message,
        url='/login',
        name=name,
        password=password
        )


def bcrypt_password(password, log_rounds):
    salt = bcrypt.gensalt(log_rounds=log_rounds)
    return bcrypt.hashpw(password, salt)


@view_config(route_name='register', renderer='register.mako')
def register(request):
    next = request.params.get('next') or request.route_url('editor')
    if authenticated_userid(request):
        return HTTPFound(location=next)

    message = ''
    if 'form.submitted' in request.params:
        try:
            name = request.params['name']
            password = request.params['password']
        except AttributeError:
            message = 'invalid form'
        else:
            log_rounds = request.registry.settings.get('bcrypt_log_rounds', 12)
            password = bcrypt_password(password, log_rounds)
            request.db.users.insert({
                'name': name,
                'password': password
                })
            headers = remember(request, name)
            return HTTPFound(location='/', headers=headers)
    return dict(
        url='/register',
        message=message
    )


@view_config(route_name='logout')
def logout(request):
    headers = forget(request)
    return HTTPFound(location='/', headers=headers)
