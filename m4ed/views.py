from pyramid.view import view_config, view_defaults, notfound_view_config
from pyramid.response import Response

from m4ed.resources import editor_less


@view_config(route_name='home', renderer='templates/mytemplate.pt')
def home(request):
    return {'project': 'm4ed'}


@view_config(route_name='editor', renderer='editor.mako')
def editor(request):
    # Include .less
    editor_less.need()
    return {
        'project': 'm4ed',
        'items': request.context
    }


@view_defaults(route_name='rest_item', renderer='json')
class RESTItemView(object):
    def __init__(self, request):
        self.request = request

    @view_config(request_method='GET')
    def get(self):
        return self.request.context

    @view_config(request_method='POST')
    def post(self):
        return {'result': 'POST accepted'}

    @view_config(request_method='PUT')
    def put(self):
        return {'result': 'PUT accepted'}

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

    @view_config(request_method='GET')
    def get(self):
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


@notfound_view_config(append_slash=True)
def notfound(request):
    request.response.status = 404
    return Response('<h1>404 - Not Found</h1><p>Whatever you were looking for, it is not here.</p>')


@view_config(route_name='misaka', renderer='json', request_method='POST')
def POST_misaka(request):
    text = request.params.get('md', '')

    html = request.misaka.render(text)
    return {
        'html': html
    }