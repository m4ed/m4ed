from pyramid.security import Allow, Everyone, ALL_PERMISSIONS

from pymongo import ASCENDING
from pymongo.errors import InvalidId
from bson import ObjectId

from .models import Asset, Item


class AssetFactory(dict):
    __name__ = None
    __parent__ = None

    __acl__ = [
        (Allow, Everyone, ALL_PERMISSIONS)
    ]

    def __init__(self, request):
        self.request = request
        print request.method
        self._id = request.matchdict.get('id')
        self.collection = request.db.assets

    def _get(self, query=None):
        print 'The query was ', query
        return self.collection.find_one(query) or dict()

    def _put(self, query=None):
        try:
            kwargs = self.request.json_body
        except ValueError:
            # If we get a value error, the request didn't have a json body
            # Ignore the request
            return {}
        update = {}

        try:
            kwargs.pop('_id')
            # update['desc'] = kwargs.pop('desc')
            update['name'] = kwargs.pop('name')
            update['tags'] = kwargs.pop('tags')
            # update['url'] = kwargs.pop('url')
            # update['thumbnail_url'] = kwargs.pop('thumbnail_url')
            # update['delete_url'] = kwargs.pop('delete_url')
            # update['delete_type'] = kwargs.pop('delete_type')
            # update['id'] = kwargs.pop('id')
            # update['type'] = kwargs.pop('type')
            # update['size'] = kwargs.pop('size')

        except ValueError, e:
            print e

        # If we still haven't gone through all the parameters,
        # assume something stupid was PUT'ed and abort
        # if len(kwargs) != 0:
        #     print 'Incorrect amount of parameters!'
        #     print 'The extra ones given are listed below'
        #     print kwargs
        #     raise ValueError

        return self.collection.find_and_modify(
            query=query,
            update=update
            )

    #TODO Implement us!
    def _post(self, query=None):
        return {}

    def _delete(self, query=None):
        return {}

    def __getitem__(self, _id):
        query_params = {}
        try:
            query_params['_id'] = ObjectId(_id)
        except InvalidId:
            return {'error': 'Invalid Object ID'}
        finally:
            print 'Asset API call with ', query_params
            a = self.collection.find_one(query_params) or dict()
        return Asset(a, name=str(_id), parent=self)

    def __iter__(self):
        assets = self.collection.find()  # .sort('index', direction=ASCENDING)
        return (Asset(a, name=str(a['_id']), parent=self) for a in assets)


class ItemFactory(dict):
    __name__ = None
    __parent__ = None

    __acl__ = [
        (Allow, Everyone, ALL_PERMISSIONS)
    ]

    def __init__(self, request):
        self.request = request
        self._id = request.matchdict.get('id')
        self.collection = request.db.items

    def _get(self, query=None):
        print 'The query was ', query
        return self.collection.find_one(query) or dict()

    def _put(self, query=None):
        try:
            kwargs = self.request.json_body
        except ValueError:
            # If we get a value error, the request didn't have a json body
            # Ignore the request
            return {}
        update = {}

        try:
            kwargs.pop('_id')
            update['listIndex'] = kwargs.pop('listIndex')
            update['type'] = kwargs.pop('type')
            update['title'] = kwargs.pop('title')
            update['desc'] = kwargs.pop('desc')
            update['text'] = kwargs.pop('text')
        except ValueError, e:
            print e

        # If we still haven't gone through all the parameters,
        # assume something stupid was PUT'ed and abort
        # if len(kwargs) != 0:
        #     print 'Incorrect amount of parameters!'
        #     print 'The extra ones given are listed below'
        #     print kwargs
        #     raise ValueError

        return self.collection.find_and_modify(
            query=query,
            update=update
            )

    #TODO Implement us!
    def _post(self, query=None):
        return {}

    def _delete(self, query=None):
        return {}

    def __getitem__(self, _id):
        # Might be unnecessary
        method = self.request.method
        if method not in ['GET', 'POST', 'PUT', 'DELETE']:
            return
        query_params = {}

        try:
            query_params['_id'] = ObjectId(_id)
        except InvalidId:
            return {'error': 'Invalid Object ID'}

        # Prefix the lowercase request method with an underscore and call
        # it as a function to invoke the request handler
        handler = '_' + method.lower()
        item = getattr(self, handler)(query=query_params)

        return Item(item, name=str(_id), parent=self)

    def __iter__(self):
        items = self.collection.find().sort('listIndex', direction=ASCENDING)
        return (Item(item, name=str(item['_id']), parent=self) for item in items)
