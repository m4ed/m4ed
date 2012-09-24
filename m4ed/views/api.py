from pyramid.view import (
    view_config,
    view_defaults
    )

from pyramid.httpexceptions import (
    HTTPSeeOther,
    HTTPNotAcceptable
    )

import logging
log = logging.getLogger(__name__)

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
        self.item = request.context

    @view_config(request_method='GET', permission='read')
    def get(self):
        log.debug(self.item)
        return self.item

    @view_config(request_method='PUT', permission='write')
    def put(self):
        
        # Request context should be m4ed.models.Item
        res = self.item.save()
        if res is None:
            self.request.response.status = '500'
            log.debug(('PUT request denied with {0}.'
                'Result from self.item.save() returned was {1}'
                ).format(self.request.response.status, res))
        else:
            self.request.response.status = '200'
        return {}

    @view_config(request_method='DELETE', permission='write')
    def delete(self):
        self.item.remove()
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
        self.item_factory = request.context

    @view_config(request_method='GET', permission='read')
    def get(self):
        res = []
        for item in self.item_factory:
            res.append(item)
        return res

    @view_config(request_method='POST')
    def post(self):
        # m4ed.factories.ItemFactory
        return self.item_factory.create_item()


@view_defaults(route_name='rest_asset', renderer='json')
class AssetView(object):
    def __init__(self, request):
        self.request = request
        self.asset = request.context

    @view_config(request_method='GET', permission='read')
    def get(self):
        return self.asset

    @view_config(request_method='PUT')
    def put(self):
        # m4ed.models.Asset
        return self.asset.save()

    @view_config(request_method='DELETE')
    def delete(self):
        _id = self.asset.get('_id')
        self.request.work_queue.send('delete:' + str(_id))
        return {'result': 'done'}


@view_defaults(route_name='rest_assets', renderer='json')
class AssetsView(object):
    def __init__(self, request):
        self.request = request
        self.asset_factory = self.request.context

    @view_config(request_method='GET', permission='read')
    def get(self):
        res = []
        for asset in self.asset_factory:
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


@view_defaults(route_name='rest_clusters', renderer='json')
class ClustersView(object):
    def __init__(self, request):
        self.request = request
        self.space_factory = request.context

    @view_config(request_method='GET', permission='read')
    def get(self):
        res = []
        for cluster in self.space_factory:
            res.append(cluster.stripped)
        return res

    @view_config(request_method='POST', permission='write')
    def post(self):
        # Context should be m4ed.factories.SpaceFactory
        res = self.space_factory.create_cluster()
        print res
        if res is None:
            self.request.response.status = '500'
            res = {'err': True}

        return res

@view_defaults(route_name='rest_cluster', renderer='json')
class ClusterView(object):
    def __init__(self, request):
        self.request = request
        self.cluster = request.context
        self.api_safe_cluster = self.cluster.stripped

    @view_config(request_method='GET', permission='read')
    def get(self):
        return self.api_safe_cluster

    @view_config(request_method='PUT', permission='write')
    def put(self):
        # Context should be m4ed.models Cluster
        res = self.cluster.save()
        if res['err'] is not None:
            self.request.response.status = '500'
        else:
            self.request.response.status = '200'
        return {}


    @view_config(request_method='DELETE', permission='write')
    def delete(self):
        # Context should be m4ed.models Cluster
        pass
