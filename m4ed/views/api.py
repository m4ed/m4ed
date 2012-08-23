from pyramid.view import (
    view_config,
    view_defaults
    )

from pyramid.httpexceptions import (
    HTTPSeeOther,
    HTTPNotAcceptable
    )

from pyramid.security import authenticated_userid

from bson import ObjectId

#import os


@view_config(route_name='rest_asset_thumb')
def get_asset_thumb(request):
    #headers = [('Location', str(request.context.get('thumbnail_url')))]
    return HTTPSeeOther(location=request.context.get('thumbnail_url'))


@view_config(route_name='rest_asset_full_image')
def get_asset_url(request):
    #headers = [('Location', str(request.context.get('url')))]
    return HTTPSeeOther(location=request.context.get('url'))


@view_defaults(route_name='rest_item', renderer='json')
class ItemView(object):
    def __init__(self, request):
        self.request = request

    @view_config(request_method='GET', permission='read')
    def get(self):
        # if not self.request.context:
        #     self.request.response.status = '404'
        #     return {}
        return self.request.context

    # @view_config(request_method='POST', permission='write')
    # def post(self):
    #     return {'result': 'POST accepted'}

    @view_config(request_method='PUT', permission='write')
    def put(self):
        # if not self.request.context:
        #     self.request.response.status = '404'
        #     return {}
        try:
            kwargs = self.request.json_body
        except ValueError:
            # If we get a value error, the request didn't have a json body
            # Ignore the request
            return HTTPNotAcceptable()
        update = {}

        if not kwargs.pop('_id', None):
            self.request.response.status = '503'
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

    # @view_config(request_method='DELETE')
    # def delete(self):
    #     return {'result': 'DELETE accepted'}


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
class AssetView(object):
    def __init__(self, request):
        self.request = request

    @view_config(request_method='GET', permission='read')
    def get(self):
        #print 'We don\'t get here'
        return self.request.context

    @view_config(request_method='PUT')
    def put(self):
        # if not self.request.context:
        #     self.request.status = '404'
        #     return {}
        try:
            kwargs = self.request.json_body
        except ValueError:
            # If we get a value error, the request didn't have a json body
            # Ignore the request
            return HTTPNotAcceptable('Send JSON.')
        update = {}

        if not kwargs.pop('_id', None):
            # Internal Server Error
            self.request.response.status = '500'
            return {}
        update['title'] = kwargs.pop('title')
        update['tags'] = kwargs.pop('tags')

        asset = self.request.context
        asset.update(update)
        _id = asset.get('_id')
        # We can't update the mongo ObjectId so pop it
        asset.pop('_id')
        asset.pop('id')

        self.request.context = self.request.db.assets.find_and_modify(
            query={'_id': ObjectId(_id)},
            update={'$set': asset},
            upsert=True,
            safe=True
        )

        self.request.response.status = '200'
        return {}

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
        if not authenticated_userid(request):
            return {'result': 'error', 'why': 'diaf'}

        post_param = dict(request.POST)
        print post_param

        file_path = post_param.get('path')
        settings = request.registry.settings['assets']

        if file_path and file_path.startswith(settings['tmp_path']):
            #if not settings['store_locally']:
            request.work_queue.send_string('save:' + file_path)

        #del data['_id']
        return [dict(result='saa')]
