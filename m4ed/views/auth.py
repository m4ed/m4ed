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

from m4ed.util import constant_time_compare
from m4ed.util.filters import force_utf8
from m4ed.factories import UserFactory


import bcrypt


def valid_login(request):
    name, password = valid_login_form(request)
    if not name:
        return False
    user_factory = UserFactory(request)

    user = user_factory.get(name)
    if not user:
        return False
    password = force_utf8(password)

    return valid_password(user, password)


def valid_login_form(request):
    try:
        name = request.params['name']
        password = request.params['password']
    except KeyError:
        return (False, False)
    return (name, password)


def valid_password(user, password):
    try:
        expected_hash = bcrypt.hashpw(password, user.password)
        if not constant_time_compare(user.password, expected_hash):
            return False
    except AttributeError:
        # When the user has no password for some reason
        # message = 'Invalid password'
        return False
        #pass
    # work_factor = int(user.password.split("$")[2])
    # if DEFAULT_WORK_FACTOR == work_factor:
    #     return user
    return user

    # else:
    #     pass  # TODO make new password set here


@view_config(route_name='login', renderer='login.mako')
@forbidden_view_config(renderer='login.mako')
def login(request):
    #print request.session
    next = request.params.get('next') or request.route_url('editor')
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


def bcrypt_password(password, log_rounds):
    if not isinstance(log_rounds, int):
        log_rounds = int(log_rounds)
    salt = bcrypt.gensalt(log_rounds=log_rounds)
    return bcrypt.hashpw(password, salt)


def valid_registration(request):
    #form_data = valid_registration_form(request)
    message = ''
    params = request.params
    name = force_utf8(params.get('name', ''))
    pw1 = force_utf8(params.get('pw1', ''))
    pw2 = force_utf8(params.get('pw2', ''))
    email = request.params.get('email', '')
    #name, pw1, pw2, email = form_data
    print [name, pw1, pw2]
    if '' in [name, pw1, pw2]:
        message = 'Name and password are required'
        return (dict(name=name, email=email), message)

    user_factory = UserFactory(request)
    user = user_factory.get(name)

    if user:
        message = 'username already taken'
    elif not constant_time_compare(pw1, pw2):
        message = 'passwords don\'t match try again!1'
    else:
        work_factor = request.registry.settings.get('bcrypt_log_rounds', '12')
        password = bcrypt_password(pw1, work_factor)
        new_user = user_factory.save({
           'name': name,
           'password': password,
           'email': email
           })

        return (new_user, message)

    return (dict(name=name, email=email), message)


# def valid_registration_form(request):
#     params = request.params
#     return [

#     ]
    #return (name, pw1, pw2, email)


@view_config(route_name='register', renderer='register.mako')
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
            headers = remember(request, user.name)
            return HTTPFound(location=next, headers=headers)
        except AttributeError:
            name = user.get('name')
            email = user.get('email')

    return dict(
        url='/register',
        message=message,
        name=name,
        email=email
    )


@view_config(route_name='logout')
def logout(request):
    headers = forget(request)
    return HTTPFound(location='/', headers=headers)
