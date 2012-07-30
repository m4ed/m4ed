from pyramid.security import Allow, Everyone, ALL_PERMISSIONS

from pymongo import ASCENDING
from pymongo.errors import InvalidId
from bson import ObjectId

from .util import Base62


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

    def __getitem__(self, _id):
        query_params = {}
        try:
            query_params['_id'] = ObjectId(_id)
        except InvalidId:
            query_params['id'] = str(Base62(_id))
        finally:
            print 'Assset API call with ', query_params
            a = self.collection.find_one(query_params) or dict()
        return Asset(a, name=str(_id), parent=self)

    def __iter__(self):
        assets = self.collection.find()  # .sort('index', direction=ASCENDING)
        return (Asset(a, name=str(a['_id']), parent=self) for a in assets)


class Asset(dict):
    @property
    def __acl__(self):
        return [
            (Allow, Everyone, ALL_PERMISSIONS)
        ]

    def __init__(self, a_dict, name=None, parent=None):
        super(Asset, self).__init__(self)
        self.update(a_dict)
        # Make sure the ObjectId is json seriablable
        self['_id'] = str(self['_id'])
        self.__name__ = name
        self.__parent__ = parent

    def __getattr__(self, key):
        attr = self.get(key, None)
        if attr is None:
            raise AttributeError(key)
        return attr


class EditorFactory(dict):
    __name__ = None
    __parent__ = None

    __acl__ = [
        (Allow, Everyone, ALL_PERMISSIONS)
    ]

    def __init__(self, request):
        self.request = request
        self._id = request.matchdict.get('id')
        self.collection = request.db.items

    def __getitem__(self, _id):
        query_params = {}
        try:
            query_params['_id'] = ObjectId(_id)
        except InvalidId:
            return None

        # Don't return the text of this item
        a = self.collection.find_one(query_params, {'text': 0}) or dict()

        return Item(a, name=str(_id), parent=self)

    def __iter__(self):
        # Don't return the text of this item
        items = self.collection.find(fields={'text': 0})  # .sort('index', direction=ASCENDING)
        return (Item(a, name=str(a['_id']), parent=self) for a in items)


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
        kwargs.pop('_id')
        update['title'] = kwargs.pop('title')
        update['desc'] = kwargs.pop('desc')
        update['text'] = kwargs.pop('text')
        update['exercises'] = kwargs.pop('exercises')

        # If we still haven't gone through all the parameters,
        # assume something stupid was PUT'ed and abort
        # if len(kwargs) != 0:
        #     print 'Incorrect amount of parameters! The extra ones given are listed below'
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
        print _id
        try:
            query_params['_id'] = ObjectId(_id)
        except InvalidId:
            query_params['id'] = str(Base62(_id))

        # Prefix the lowercase request method with an underscore and call
        # it as a function to invoke the request handler
        handler = '_' + self.request.method.lower()
        item = getattr(self, handler)(query=query_params)
        print item
        return Item(item, name=str(_id), parent=self)

    def __iter__(self):
        items = self.collection.find()  # .sort('index', direction=ASCENDING)
        return (Item(a, name=str(a['_id']), parent=self) for a in items)


class Item(dict):
    @property
    def __acl__(self):
        return [
            (Allow, Everyone, ALL_PERMISSIONS)
        ]

    def __init__(self, a_dict, name=None, parent=None):
        super(Item, self).__init__(self)
        self.update(a_dict)
        # Make sure the ObjectId is json seriablable
        self['_id'] = str(self['_id'])
        self.__name__ = name
        self.__parent__ = parent

    def __getattr__(self, key):
        attr = self.get(key, None)
        if attr is None:
            raise AttributeError(key)
        return attr
