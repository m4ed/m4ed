from pyramid.view import view_config
from pyramid.httpexceptions import HTTPFound
from pyramid.security import (
    remember,
    forget,
    authenticated_userid
    )


@view_config(route_name='login', renderer='login.mako')
#@forbidden_view_config(renderer='login.mako')
def login(request):
    print request.session
    next = request.params.get('next') or request.route_url('editor')
    if authenticated_userid(request):
        return HTTPFound(location=next)
    login = ''
    password = ''
    message = ''
    if 'form.submitted' in request.params:
        login = request.params['login']
        password = request.params['password']
        user = request.db.users.find_one({'username': login}) or dict()
        if user.get('password') == password:
            headers = remember(request, login)
            return HTTPFound(location='/', headers=headers)
        message = 'Failed'

    return dict(
        message=message,
        url='/login',
        login=login,
        password=password
        )


@view_config(route_name='logout')
def logout(request):
    headers = forget(request)
    return HTTPFound(location='/', headers=headers)
