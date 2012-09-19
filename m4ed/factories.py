from pyramid.security import (
    authenticated_userid,
    effective_principals,
    has_permission,
    Allow,
    Deny,
    Everyone,
    Authenticated,
    ALL_PERMISSIONS,
    DENY_ALL
    )

from pymongo import ASCENDING
from pymongo.errors import InvalidId
from bson import ObjectId

from valideer.base import ValidationError

from m4ed.util.base62 import Base62
#from .util import filters
from m4ed.util import validators
from m4ed.util import constant_time_compare

import bcrypt

from .models import (
    Asset,
    Item,
    User,
    Space,
    Cluster
    )

import time


class RootFactory(object):
    __acl__ = [
        (Allow, 'g:superuser', ALL_PERMISSIONS),
        DENY_ALL  # The last resort
    ]

    def __init__(self, request):
        pass


class BaseFactory(object):
    __name__ = None
    __parent__ = RootFactory

    __acl__ = [
        (Allow, 'g:superuser', ALL_PERMISSIONS),
        DENY_ALL
    ]

    def __init__(self, request, collection, model,
                 validator=None, name=None, parent=RootFactory):
        self.request = request
        self._id = request.matchdict.get('id')
        if isinstance(collection, basestring):
            self.collection = request.db[collection]
        else:
            # TODO: Check that 'collection' is actually a mongo collection
            self.collection = collection
        self.model = model
        self.validator = validator
        self.name = name
        self.parent = parent

    # Override if necessary
    def __getitem__(self, _id):
        try:
            query = dict(_id=ObjectId(_id))
        except InvalidId:
            raise KeyError
        item = self.collection.find_one(query)

        if not item:
            raise KeyError

        return self.model(item, name=str(_id), parent=self)

    # Override if necessary
    def __iter__(self):
        items = self.collection.find()
        return (self.model(item, name=str(item['_id']), parent=self) for item in items)

    def get(self, name, default=None):
        try:
            return self.__getitem__(name)
        except KeyError:
            return default

    def validate(self, data):
        if not self.validator:
            # TODO: Maybe figure out what to do if we don't have a validator?
            return data
        try:
            data = self.validator.validate(data)
        except ValidationError:
            return None
        return data

    def is_valid(self, data):
        if not self.validator:
            return True
        #for key, value in data.iteritems():
        #    data[key] = filters.force_utf8(value)
        return self.validator.is_valid(data)

    def save(self, data):
        # At this point data is ensured to be in correct format
        # if this validation passes
        data = self.validate(data)
        if not data:
            return None
        # Ensure that the _id gets removed before insert
        # since mongo does not allow rewriting _id
        data.pop('_id', None)
        _id = self.collection.insert(data, safe=True)
        return self.model(data, name=str(_id), parent=self)


class AssetFactory(BaseFactory):

    __acl__ = [
        (Allow, Authenticated, ALL_PERMISSIONS),
        #(Allow, 'g:superuser', 'write')
    ]

    def __init__(self, *args, **kwargs):
        kwargs.update(dict(
            collection='assets',
            model=Asset
            ))
        BaseFactory.__init__(self, *args, **kwargs)

    def __getitem__(self, _id):
        query_params = {}
        try:
            query_params['_id'] = ObjectId(_id)
        except InvalidId:
            try:
                query_params['id'] = str(Base62(str(_id)))
            except TypeError:  # pragma: no cover
                raise KeyError

        a = self.collection.find_one(query_params)

        if not a:
            raise KeyError

        return Asset(a, name=str(_id), parent=self)


class ItemFactory(BaseFactory):

    __acl__ = [
        (Allow, Authenticated, ALL_PERMISSIONS),
        #(Allow, 'g:superuser', ALL_PERMISSIONS)
    ]

    def __init__(self, request):
        BaseFactory.__init__(
            self,
            request=request,
            collection='items',
            model=Item,
            validator=validators.get_item_validator()
            )
        self.__parent__ = ClusterFactory
        self.user_id = authenticated_userid(request)
        self.progress_collection = request.db.progress

    def __getitem__(self, _id):
        try:
            query = dict(_id=ObjectId(_id))
        except InvalidId:
            raise KeyError
        item = self.collection.find_one(query)

        if not item:
            raise KeyError

        return self.model(item, name=str(_id), parent=self)

    def __iter__(self):
        cluster_id = self.request.matchdict.get('cluster_id', None)
        if cluster_id:
            items = self.collection.find({'cluster_id': ObjectId(cluster_id)})
        else:
            items = self.collection.find()
        items.sort('listIndex', direction=ASCENDING)
        return (self.model(item, name=str(item['_id']), parent=self) for item in items)

    def save(self, item):
        item = self.validate(item)
        if not item:
            return None

        _id = item.pop('_id', None)

        # These 2 should never be in the item?
        # item.pop('__name__', None)
        # item.pop('__parent__', None)
        self.collection.update(
            {'_id': _id},
            {'$set': item},
            upsert=True,
            safe=True
        )

        # Reset the progress on this item
        self.progress_collection.update(
            {'itemId': _id},
            {'$set': {'passed': False, 'unanswered': item['answers'].keys()}},
            upsert=True,
            safe=True
        )

    def remove(self, item):
        # Pop the item ID since we can't update it
        _id = item.pop('_id', None)
        if not _id:
            return
        elif not isinstance(_id, ObjectId):
            _id = ObjectId(_id)
        item.pop('__name__', None)
        item.pop('__parent__', None)
        self.collection.remove(
            {'_id': _id},
            safe=True
        )

        self.progress_collection.remove(
            {'itemId': _id},
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


class UserFactory(BaseFactory):

    __acl__ = [
        #(Allow, Authenticated, ALL_PERMISSIONS)
    ]

    def __init__(self, request):
        BaseFactory.__init__(
            self,
            request=request,
            collection='users',
            model=User
            )

    def __getitem__(self, _id):
        try:
            query = dict(_id=ObjectId(_id))
        except InvalidId:
            query = dict(username=_id)

        item = self.collection.find_one(query)

        if not item:
            raise KeyError

        return self.model(item, name=str(_id), parent=self)

    def __setitem__(self, user):
        self.save(user)

    def login(self):
        params = self.request.POST
        # Try to extract the login data
        try:
            username = params['username']
            password = params['password']
        except KeyError:
            return None
        # Query for the user from the database
        user = self.get(username, None)
        if not user:
            return None
        # Compare provided password with user's password
        try:
            expected_hash = bcrypt.hashpw(password, user.password)
            if not constant_time_compare(user.password, expected_hash):
                return None
        except AttributeError:
            # When the user has no password for some reason
            return None

        # If everything matches, return the queried user object
        return user

    @staticmethod
    def bcrypt_password(password, log_rounds):
        if not isinstance(log_rounds, int):
            log_rounds = int(log_rounds)
        salt = bcrypt.gensalt(log_rounds=log_rounds)
        return bcrypt.hashpw(password, salt)

    def create_user(self):
        request = self.request
        params = request.POST
        settings = request.registry.settings
        validator = validators.get_user_registration_form_validator()
        try:
            data = dict(
                username=params['username'],
                pw1=params['pw1'],
                pw2=params['pw2'],
                email=params.get('email', None)
                )
            #if data['email'] == '':
            #    data['email'] = None
            data = validator.validate(data)
        except (KeyError):
            return {'success': False, 'message': 'Invalid form'}
        except (ValidationError), e:
            print e
            return {'success': False, 'data': data, 'message': str(e)}

        if self.get(data['username']):
            return {'success': False, 'data': data, 'message': 'Username alread taken'}
        if data['pw1'] != data['pw2']:
            return {'success': False, 'data': data, 'message': 'Passwords did not match'}

        work_factor = settings.get('bcrypt_log_rounds', '12')
        password = self.bcrypt_password(data['pw1'], work_factor)
        new_user = self.save({
           'username': data['username'],
           'password': password,
           'email': data['email'],
           'groups': []
           })

        return {'success': True, 'user': new_user}

    def save(self, user):
        _id = self.collection.insert(user, safe=True)
        return self.model(user, name=str(_id), parent=self)

    def __iter__(self):
        items = self.collection.find().sort('listIndex', direction=ASCENDING)
        return (self.model(item, name=str(item['_id']), parent=self) for item in items)


class SpaceFactory(BaseFactory):

    __acl__ = [
        #(Allow, Authenticated, 'read')
    ]

    def __init__(self, request):
        BaseFactory.__init__(
            self,
            request=request,
            collection='spaces',
            model=Space,
            validator=validators.get_space_validator()
            )
        self.children = ClusterFactory(request)

    def __getitem__(self, _id):
        # Try first to convert the given _id.
        # If this fails just raise KeyError to
        # for a 404 response from Pyramid
        try:
            query = dict(_id=ObjectId(_id))
        except InvalidId:
            raise KeyError

        s = self.collection.find_one(query)
        if not s:
            raise KeyError

        clusters = list()
        for child in self.children:
            if has_permission('read', child, self.request):
                clusters.append(child)

        s['clusters'] = clusters

        return self.model(s, name=str(_id), parent=self)

    def create_space(self):
        params = self.request.POST
        try:
            return self.save(dict(
                title=params['title'],
                desc=params['desc']
                ))
        except KeyError:
            return None

    def create_cluster(self):
        cluster_factory = ClusterFactory(self.request)
        return cluster_factory.create()


class ClusterFactory(BaseFactory):

    __acl__ = [
        #(Allow, Authenticated, 'read')
    ]

    def __init__(self, request):
        BaseFactory.__init__(
            self,
            request=request,
            collection='clusters',
            model=Cluster,
            validator=validators.get_cluster_validator()
            )
        self.__parent__ = SpaceFactory
        self._children = ItemFactory

    def __getitem__(self, _id):
        # Try first to convert the given _id.
        # If this fails just raise KeyError to
        # for a 404 response from Pyramid
        try:
            query = dict(_id=ObjectId(_id))
        except InvalidId:
            raise KeyError

        s = self.collection.find_one(query)
        if not s:
            raise KeyError

        items = list()

        children = self._children
        # Try to determine if the factory has been initialized before
        if isinstance(children, object.__class__):
            children = children(self.request)
            # if not isinstance(children, self._children):
            #     raise TypeError(('"children" should be an instance of ',
            #         '"ItemFactory", not "{}"'.format(type(children))))
        for child in children:
            if has_permission('read', child, self.request):
                items.append(child)

        s['items'] = items

        return self.model(s, name=str(_id), parent=self)

    def create(self):
        # In case you wonder: All the parameters for create should
        # be passed through POST/GET or matchdict parameters
        try:
            return self.save({
                'space_id': self.request.matchdict['space_id'],
                'title': self.request.POST['title'],
                'desc': self.request.POST['desc'],
                'groups_read': [authenticated_userid(self.request)],
                'groups_write': [authenticated_userid(self.request)]
            })
        except KeyError:
            # Might be raised from request not containing
            # all the parameters
            return None

    # def save(self, data):
    #     if not self.is_valid(data):
    #         return None
    #     #space_id = data.get('space_id', None)
    #     #if space_id and not isinstance(space_id, ObjectId):
    #     # Validation should ensure that the space_id at this point
    #     # is a string
    #     #try:
    #     #    data['space_id'] = ObjectId(data['space_id'])
    #     #except InvalidId:
    #     _id = self.collection.insert(data, safe=True)
    #     return self.model(data, name=str(_id), parent=self)

    def __iter__(self):
        # Check if the request has space_id in the matchdict which
        # indicates that we're probably inside a learning space right now
        # and should filter down the find() results
        space_id = self.request.matchdict.get('space_id', None)
        if space_id:
            items = self.collection.find({'space_id': ObjectId(space_id)})
        else:
            items = self.collection.find()
        return (self.model(item, name=str(item['_id']), parent=self) for item in items)
