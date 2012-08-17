from pyramid.view import (
    view_config,
    view_defaults,
    notfound_view_config,
    forbidden_view_config
    )
from pyramid.response import Response
from pyramid.security import (
    remember,
    forget,
    authenticated_userid
    )
from pyramid.httpexceptions import (
    HTTPFound,
    HTTPMethodNotAllowed,
    HTTPNotAcceptable,
    HTTPSeeOther
    )
from bson import ObjectId

from m4ed.resources import editor_less


@view_config(route_name='home', renderer='templates/mytemplate.pt')
def home(request):
    return {'project': 'm4ed'}


@view_config(route_name='editor', renderer='editor.mako', permission='read')
def editor(request):
    # Include .less
    request.session['wakalaka'] = 'yep'
    editor_less.need()
    return {
        'project': 'm4ed',
        'items': request.context
    }


@view_config(route_name='rest_asset_thumb')
def get_asset_thumb(request):
    #headers = [('Location', str(request.context.get('thumbnail_url')))]
    return HTTPSeeOther(location=request.context.get('thumbnail_url'))


@view_config(route_name='rest_asset_full_image')
def get_asset_url(request):
    #headers = [('Location', str(request.context.get('url')))]
    return HTTPSeeOther(location=request.context.get('url'))


@view_defaults(route_name='rest_item', renderer='json')
class RESTItemView(object):
    def __init__(self, request):
        self.request = request

    @view_config(request_method='GET', permission='read')
    def get(self):
        if not self.request.context:
            self.request.status = '404'
            return {}
        return self.request.context

    @view_config(request_method='POST', permission='write')
    def post(self):
        return {'result': 'POST accepted'}

    @view_config(request_method='PUT', permission='write')
    def put(self):
        if not self.request.context:
            self.request.status = '404'
            return {}
        try:
            kwargs = self.request.json_body
        except ValueError:
            # If we get a value error, the request didn't have a json body
            # Ignore the request
            return HTTPNotAcceptable()
        update = {}

        if not kwargs.pop('_id', None):
            self.request.status = '503'
            return {}
        update['listIndex'] = kwargs.pop('listIndex')
        update['type'] = kwargs.pop('type')
        update['title'] = kwargs.pop('title')
        update['desc'] = kwargs.pop('desc')
        update['text'] = kwargs.pop('text')

        item = self.request.context
        item.update(update)
        _id = item.get('_id')
        # We can't update the mongo ObjectId so pop it
        item.pop('_id')

        self.request.context = self.request.db.items.find_and_modify(
            query={'_id': ObjectId(_id)},
            update={'$set': item},
            upsert=True,
            safe=True
        )

        self.request.response.status = '200'
        return {}

    @view_config(request_method='DELETE')
    def delete(self):
        return {'result': 'PUT accepted'}


@view_defaults(route_name='rest_items', renderer='json')
class RESTItemsView(object):

    def __init__(self, request):
        self.request = request

    @view_config(request_method='GET')
    def get(self):
        res = []
        for item in self.request.context:
            res.append(item)
        return res

    @view_config(request_method='POST')
    def post(self):
        return {'result': 'POST accepted'}

    @view_config(request_method='PUT')
    def put(self):
        return {'result': 'PUT accepted'}

    @view_config(request_method='DELETE')
    def delete(self):
        return {'result': 'PUT accepted'}


# @view_defaults(route_name='rest_folders', renderer='json')
# class RESTFoldersView(object):
#     def __init__(self, request):
#         self.request = request

#     @view_config(request_method='GET')
#     def get(self):
#         return self.request.context


@view_defaults(route_name='rest_asset', renderer='json')
class RESTAssetView(object):
    def __init__(self, request):
        self.request = request

    @view_config(request_method='GET', permission='read')
    def get(self):
        print 'We don\'t get here'
        return self.request.context


@view_defaults(route_name='rest_assets', renderer='json')
class RESTAssetsView(object):
    def __init__(self, request):
        self.request = request

    @view_config(request_method='GET')
    def get(self):
        res = []
        for asset in self.request.context:
            res.append(asset)
        return res

    @view_config(request_method='POST')
    def post(self):
        return Response('POST received - not that we can actully do anything with it yet.')


@notfound_view_config(append_slash=True, renderer='404.mako')
def notfound(request):
    request.response.status = '404'
    return {}


@view_config(route_name='misaka', renderer='json', request_method='POST')
def POST_misaka(request):
    text = request.params.get('md', '')

    html = request.misaka.render(text)
    return {
        'html': html
    }


@view_config(route_name='login', renderer='login.mako', permission='read')
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
