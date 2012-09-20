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
from pyramid.httpexceptions import (
    HTTPSeeOther,
    HTTPNotAcceptable
    )

from pymongo import ASCENDING
from pymongo.errors import InvalidId
from bson import ObjectId

from valideer.base import ValidationError

from m4ed.util.base62 import Base62
#from .util import filters
from m4ed.util import validators
from m4ed.util import constant_time_compare
from m4ed.models import (
    Asset,
    Item,
    User,
    Space,
    Cluster
    )

import bcrypt

from misaka import (
    Markdown,
    EXT_TABLES
    )

from m4ed.htmlrenderer import CustomHtmlRenderer

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

    def _read_params(self):
        if self.request.is_xhr:
            try:
                params = self.request.json_body
            except ValueError:
                # If we get a value error, the request didn't have a json body
                # Ignore the request with 406 - Not Acceptable error
                self.request.response.status = '406'
                return {'err': True}
            if not params.pop('_id', None):
                # This should never ever happen but if it does, just respond with
                # 503 - Service Unavailable error
                self.request.response.status = '503'
                return {'err': True}
        else:
            params = self.request.POST

        return params

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

    def commit(self, data):
        # This check needs to be done before validating
        # since valideer converts data to normal dictionary
        is_model = isinstance(data, self.model)
        # At this point data is ensured to be in correct format
        # if this validation passes
        data = self.validate(data)
        if not data:
            return None
        # Ensure that the _id gets removed before insert
        # since mongo does not allow rewriting _id
        _id = data.pop('_id', None)
        # Check if this is a new item or just an update
        if is_model:
            if _id is None:
                raise TypeError(('Invalid model type did not contain'
                                'required attr \'_id\''))
            return self.collection.find_and_modify(
                query={'_id': _id},
                update={'$set': data},
                upsert=True,
                safe=True,
                new=True
            )

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

    def save_asset(self, asset):
        params = self._read_params()
        if params.get('err') is True:
            return params

        asset.maybe_set('title', params)
        asset.maybe_set('tags', params)

        asset.commit()

        self.request.response.status = '200'
        return {}


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

    def _get_renderers(self):
        renderer = CustomHtmlRenderer(
            math_text_parser=self.request.math_text_parser,
            settings=self.request.registry.settings,
            mongo_db=self.request.db,
            )
        misaka_renderer = Markdown(renderer=renderer, extensions=EXT_TABLES)
        return (renderer, misaka_renderer)

    def commit(self, item):
        is_model = isinstance(item, self.model)
        # NOTE: Validation WILL convert the item to a dictionary
        item = self.validate(item)
        if not item:
            return None

        _id = item.pop('_id', None)

        if is_model:
            res = self.collection.find_and_modify(
                {'_id': _id},
                {'$set': item},
                upsert=True,
                safe=True,
                new=True
            )

            # Reset the progress on this item
            self.progress_collection.update(
                {'itemId': _id},
                {'$set': {
                    'passed': False,
                    'unanswered': item['answers'].keys()
                    }
                },
                upsert=True,
                safe=True
            )

            return res

        _id = self.collection.insert(item, safe=True)

        # Reset the progress on this item
        self.progress_collection.insert(
            {'passed': False, 'unanswered': item['answers'].keys()},
            safe=True
        )

        return self.model(item, name=str(_id), parent=self)

    def create_item(self):
        try:
            # This fails if the post is some sort of form instead of json
            kwargs = self.request.json_body
        except ValueError:
            # If we get a value error, the request didn't have a json body
            # Ignore the request
            return HTTPNotAcceptable()

        item = dict(
            title=kwargs.pop('title', 'Click to add a title'),
            desc=kwargs.pop('desc', 'Click to add a description'),
            text=kwargs.pop('text', ''),
            tags=kwargs.pop('tags', []),
            listIndex=kwargs.pop('listIndex', 0),
            cluster_id="5052f3a038d57a26a6000000"
        )

        # self.request.response.status = '200'
        return self.commit(item)

    def save_item(self, item):
        params = self._read_params()
        if params.get('err') is True:
            return params

        # Update only the parameters that were posted
        item.maybe_set('listIndex', params)
        item.maybe_set('title', params)
        item.maybe_set('desc', params)
        item.maybe_set('tags', params)
        item.maybe_set('text', params)
        # TODO: Fix this to actually assign itself to a valid cluster
        item['cluster_id'] = "5052f3a038d57a26a6000000"

        renderer, misaka_renderer = self._get_renderers()
        item['html'] = misaka_renderer.render(item['text'])
        item['answers'] = renderer.get_answers()

        # Save changes to mongo
        return item.commit()

    def remove_item(self, item):
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

    def check_answer(self, item):
        params = self.request.params
        block_id = params.get('block_id')
        answer_id = params.get('answer_id')

        is_correct = False
        # The block id has namespace infront of it
        # ex. m4ed-1 so split it out
        try:
            block_id = block_id.split('-')[1]
        except IndexError:
            return {'err': True, 'is_correct': is_correct}

        answers = self.get('answers', None)
        if answers is None:
            return {'err': False, 'is_correct': is_correct}

        block_answers = answers.get(block_id, None)
        if block_answers is None:
            return {'err': False, 'is_correct': is_correct}

        if isinstance(block_answers, list):
            if answer_id in block_answers:
                is_correct = True
        else:
            print 'WE DONT KNOW WHAT TO DO NEXT'
            return {'err': False, 'is_correct': is_correct}

        item.mark_answer(is_correct, block_id, answer_id)

        return {'err': False, 'is_correct': is_correct}

    def mark_answer(self, item, is_correct, block_id, answer_id):
        if not self.user_id:
            return
        item_progress = self.progress_collection.find_one(
            query={'itemId': ObjectId(item._id), 'userId': self.user_id}
        )
        # Check if we found an existing progress entry for this item
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
        # No existing progress found, create a new entry
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
        self.commit(user)

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
            data = validator.validate(data)
        except (KeyError):
            return {'success': False, 'message': 'Invalid form'}
        except (ValidationError), e:
            print e
            return {'success': False, 'data': data, 'message': str(e)}

        # Check if we can find a user with this username already in our database
        if self.get(data['username']) is not None:
            return {'success': False, 'data': data, 'message': 'Username alread taken'}
        # Check that the two passwords match
        if data['pw1'] != data['pw2']:
            return {'success': False, 'data': data, 'message': 'Passwords did not match'}

        work_factor = settings.get('bcrypt_log_rounds', '12')
        password = self.bcrypt_password(data['pw1'], work_factor)
        new_user = {
           'username': data['username'],
           'password': password,
           'email': data['email'],
           'groups': []
           }

        user = self.commit(new_user)

        return {'success': True, 'user': user}

    def commit(self, user):
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
        self._children = ClusterFactory

    @property
    def _cluster_factory(self):
        children = self._children
        # Try to determine if the factory has been initialized before
        if isinstance(children, object.__class__):
            children = children(self.request)
        return children

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

        for child in self._cluster_factory:
            if has_permission('read', child, self.request):
                clusters.append(child)

        s['clusters'] = clusters

        return self.model(s, name=str(_id), parent=self)

    def create_space(self):
        params = self.request.POST
        try:
            return self.commit(dict(
                title=params['title'],
                desc=params['desc']
                ))
        except KeyError:
            return None

    def create_cluster(self):
        # cluster_factory = ClusterFactory(self.request)
        return self._cluster_factory.create_cluster()


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

    @property
    def _item_factory(self):
        children = self._children
        # Try to determine if the factory has been initialized before
        if isinstance(children, object.__class__):
            children = children(self.request)
        return children

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

        for child in self._item_factory:
            if has_permission('read', child, self.request):
                items.append(child)

        s['items'] = items

        return self.model(s, name=str(_id), parent=self)

    def create_cluster(self):
        # In case you wonder: All the parameters for create should
        # be passed through POST/GET or matchdict parameters
        try:
            return self.commit({
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

    def save_cluster(self, cluster):
        raise NotImplementedError('Really it is not')

    def create_item(self):
        return self._item_factory.create_item()

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
