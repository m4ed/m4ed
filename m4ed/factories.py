from pyramid.security import (
    authenticated_userid,
    Allow,
    Deny,
    Everyone,
    Authenticated,
    ALL_PERMISSIONS
    )

from pymongo import ASCENDING
from pymongo.errors import InvalidId
from bson import ObjectId

from .util.base62 import Base62

from .models import (
    Asset,
    Item,
    User,
    Space
    )

import time


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
        self.user_id = authenticated_userid(request)
        self._id = request.matchdict.get('id')
        self.collection = request.db.items
        self.progress_collection = request.db.progress

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

    def save(self, item):
        # Pop the item ID since we can't update it
        _id = item.pop('_id', None)
        if not _id:
            return
        _id = ObjectId(_id)
        self.collection.update(
            {'_id': _id},
            {'$set': item},
            upsert=True,
            safe=True
        )

        self.progress_collection.update(
            {'itemId': _id},
            {'$set': {'passed': False, 'unanswered': item['answers'].keys()}},
            upsert=True,
            safe=True
        )

    def mark_answer(self, item, is_correct, block_id, answer_id):
        if not self.user_id:
            return
        item_progress = self.progress_collection.find_one(
            query={'itemId': ObjectId(item._id), 'userId': self.user_id}
        )
        if item_progress:
            unanswered = item_progress['unanswered']
            # If the block id is not unanswered, don't bother to
            # try to mark it as answered
            if block_id not in unanswered:
                return
            update = {'$push': {'answers': (1 if is_correct else -1)}}
            update['$pull'] = {'unanswered': block_id}
            # If it looks like this was the last unanswered question
            # mark the item as passed
            if len(unanswered) == 1:
                update['$set'] = {
                    'passed': True,
                    'firstPassed': int(time.time())
                }

            self.progress_collection.update(
                {'itemId': ObjectId(item._id), 'userId': self.user_id},
                update
            )
        else:
            unanswered = item.get('answers', {}).keys()
            if not unanswered:
                return
            if not unanswered.pop(block_id, None):
                return
            self.progress_collection.insert({
                'itemId': ObjectId(item._id),
                'userId': self.user_id,
                'unanswered': unanswered,
                'passed': False,
                'answers': [(1 if is_correct else -1)],
                'firstAccess': int(time.time())
                })


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


class SpaceFactory(dict):
    __name__ = None
    __parent__ = RootFactory

    __acl__ = [
        (Allow, Authenticated, ALL_PERMISSIONS)
    ]

    def __init__(self, request):
        self.request = request
        self._id = request.matchdict.get('id')
        self.collection = request.db.spaces

    def __getitem__(self, _id):
        #print 'This is trying to get invoked'
        try:
            query = dict(_id=ObjectId(_id))
        except InvalidId:
            query = dict(name=_id)
        item = self.collection.find_one(query)

        if not item:
            raise KeyError

        return Space(item, name=str(_id), parent=self)

    def save(self, space):
        _id = self.collection.insert(space, safe=True)
        return Space(space, name=str(_id), parent=self)
