from pyramid.view import (
    view_config,
    view_defaults
    )

from pyramid.httpexceptions import (
    HTTPSeeOther,
    HTTPNotAcceptable
    )

#from pyramid.security import authenticated_userid

#from bson import ObjectId


@view_config(route_name='rest_asset_thumb')
def get_asset_thumb(request):
    return HTTPSeeOther(location=request.context.get('thumbnail_url'))


@view_config(route_name='rest_asset_full_image')
def get_asset_url(request):
    return HTTPSeeOther(location=request.context.get('url'))


@view_defaults(route_name='rest_item', renderer='json')
class ItemView(object):
    def __init__(self, request):
        self.request = request

    @view_config(request_method='GET', permission='read')
    def get(self):
        return self.request.context

    @view_config(request_method='PUT', permission='write')
    def put(self):
        
        # Request context should be m4ed.models.Item
        res = self.request.context.update_item()
        if res['err'] is not None:
            self.request.response.status = '500'
        else:
            self.request.response.status = '200'
        return {}

    @view_config(request_method='DELETE', permission='write')
    def delete(self):
        self.request.context.remove()
        self.request.response.status = '200'
        return {}


@view_config(
    route_name='rest_item_answer',
    request_method='POST',
    permission='answer',
    renderer='json'
    )
def post_item_answer(self, request):
    res = 'incorrect'
    result = request.context.check_answer()
    if result['err'] is not None and result['is_correct']:
        res = 'correct'

    return {'I': 'See what you did there', 'res': res}


@view_defaults(route_name='rest_items', renderer='json')
class ItemsView(object):

    def __init__(self, request):
        self.request = request

    @view_config(request_method='GET', permission='read')
    def get(self):
        res = []
        for item in self.request.context:
            res.append(item)
        return res

    @view_config(request_method='POST')
    def post(self):
        # m4ed.factories.ItemFactory
        return self.request.context.create_item()

    @view_config(request_method='PUT')
    def put(self):
        return {'result': 'PUT accepted'}

    @view_config(request_method='DELETE')
    def delete(self):
        return {'result': 'DELETE accepted'}


# @view_defaults(route_name='rest_folders', renderer='json')
# class RESTFoldersView(object):
#     def __init__(self, request):
#         self.request = request

#     @view_config(request_method='GET')
#     def get(self):
#         return self.request.context


@view_defaults(route_name='rest_asset', renderer='json')
class AssetView(object):
    def __init__(self, request):
        self.request = request

    @view_config(request_method='GET', permission='read')
    def get(self):
        #print 'We don\'t get here'
        return self.request.context

    @view_config(request_method='PUT')
    def put(self):
        # m4ed.models.Asset
        return self.request.context.update_asset()

    @view_config(request_method='DELETE')
    def delete(self):
        _id = self.request.context.get('_id')
        self.request.work_queue.send('delete:' + str(_id))
        return {'result': 'done'}


@view_defaults(route_name='rest_assets', renderer='json')
class AssetsView(object):
    def __init__(self, request):
        self.request = request

    @view_config(request_method='GET', permission='read')
    def get(self):
        res = []
        for asset in self.request.context:
            res.append(asset)
        return res

    @view_config(request_method='POST', permission='write')
    def post(self):
        request = self.request
        #print request.session
        # if not authenticated_userid(request):
        #     return {'result': 'error', 'why': 'diaf'}

        post_param = dict(request.POST)
        print post_param

        file_path = post_param.get('path')
        settings = request.registry.settings['assets']

        if file_path and file_path.startswith(settings['tmp_path']):
            #if not settings['store_locally']:
            request.work_queue.send_string('save:' + file_path)

        #del data['_id']
        return [dict(result='saa')]


# @view_defaults(route_name='rest_clusters', renderer='json')
# class ClustersView(object):
#     def __init__(self, request):
#         self.request = request

#     @view_config(request_method='GET', permission='read')
#     def get(self):
#         res = []
#         for cluster in self.request.context:
#             res.append(cluster)
#         return res

#     @view_config(request_method='POST', permission='write')
#     def post(self):
#         factory = ClusterFactory(request)
