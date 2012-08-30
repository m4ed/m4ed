from pyramid.security import Allow, Deny, Everyone, Authenticated, ALL_PERMISSIONS

from pymongo import ASCENDING
from pymongo.errors import InvalidId
from bson import ObjectId

from .util.base62 import Base62

from .models import Asset, Item, User


class RootFactory(object):
    __acl__ = [
        (Allow, Authenticated, ALL_PERMISSIONS),
        (Allow, 'g:superuser', ALL_PERMISSIONS),
        #(Deny, Everyone, ALL_PERMISSIONS)
    ]

    def __init__(self, request):
        pass


class AssetFactory(dict):
    __name__ = None
    __parent__ = RootFactory

    __acl__ = [
        (Allow, Authenticated, ALL_PERMISSIONS),
        #(Allow, 'g:superuser', 'write')
    ]

    def __init__(self, request):
        self.request = request
        #print request.method
        self._id = request.matchdict.get('id')
        self.collection = request.db.assets

    def __getitem__(self, _id):
        query_params = {}
        try:
            query_params['_id'] = ObjectId(_id)
        except InvalidId:
            try:
                query_params['id'] = str(Base62(str(_id)))
            except TypeError:  # pragma: no cover
                raise KeyError
                #return {'error': 'Invalid Object ID'}

        #print 'Asset API call with ', query_params
        a = self.collection.find_one(query_params)

        if not a:
            raise KeyError

        return Asset(a, name=str(_id), parent=self)

    def __iter__(self):
        assets = self.collection.find()  # .sort('index', direction=ASCENDING)
        return (Asset(a, name=str(a['_id']), parent=self) for a in assets)


class ItemFactory(dict):
    __name__ = None
    __parent__ = RootFactory

    __acl__ = [
        (Allow, Authenticated, ALL_PERMISSIONS),
        #(Allow, 'g:superuser', ALL_PERMISSIONS)
    ]

    def __init__(self, request):
        self.request = request
        self._id = request.matchdict.get('id')
        self.collection = request.db.items

    def __getitem__(self, _id):
        try:
            query = dict(_id=ObjectId(_id))
        except InvalidId:
            raise KeyError
        item = self.collection.find_one(query)

        if not item:
            raise KeyError

        return Item(item, name=str(_id), parent=self)

    def __iter__(self):
        items = self.collection.find().sort('listIndex', direction=ASCENDING)
        return (Item(item, name=str(item['_id']), parent=self) for item in items)


class UserFactory(dict):
    __name__ = None
    __parent__ = RootFactory

    __acl__ = [
        (Allow, Authenticated, ALL_PERMISSIONS)
    ]

    def __init__(self, request):
        self.request = request
        self._id = request.matchdict.get('id')
        self.collection = request.db.users

    def __getitem__(self, _id):
        try:
            query = dict(_id=ObjectId(_id))
        except InvalidId:
            query = dict(name=_id)
        item = self.collection.find_one(query)

        if not item:
            raise KeyError

        return User(item, name=str(_id), parent=self)

    def __setitem__(self, user):
        self.save(user)

    def get(self, name, default=None):
        try:
            return self.__getitem__(name)
        except KeyError:
            return default

    def save(self, user):
        _id = self.collection.insert(user, safe=True)
        return User(user, name=str(_id), parent=self)

    def __iter__(self):
        items = self.collection.find().sort('listIndex', direction=ASCENDING)
        return (User(item, name=str(item['_id']), parent=self) for item in items)
