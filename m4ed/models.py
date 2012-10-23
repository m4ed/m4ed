from pyramid.security import (
    Allow,
    Everyone,
    Authenticated,
    ALL_PERMISSIONS,
    DENY_ALL
    )

# A list of fields that should never be returned to clients
_API_BLACK_LIST = (
    'groups_read',
    'groups_write'
)


class MongoDict(dict):

    def __init__(self, init_data, name=None, parent=None):
        dict.__init__(self)
        self.update(init_data)
        self.__name__ = name
        self.__parent__ = parent

    def _reserved(self, name):
        return name.startswith('__')

    def __getattr__(self, name):
        if self._reserved(name):
            return dict.__getattr__(self, name)
        try:
            return dict.__getitem__(self, name)
        except KeyError:
            raise AttributeError('The item has no attribute {}'.format(name))

    def __setattr__(self, name, value):
        if self._reserved(name):
            dict.__setattr__(self, name, value)
        else:
            dict.__setitem__(self, name, value)

    def __delattr__(self, name):
        if self._reserved(name):
            dict.__delattr__(self, name)
            return
        try:
            dict.__delitem__(self, name)
        except KeyError:
            raise AttributeError('The item has no attribute "{}"'.format(name))

    def save(self):
        return self.__parent__.save(self)

    def commit(self):
        return self.__parent__.commit(self)

    def remove(self):
        self.__parent__.remove(self)

    # Only set the attribute if it already exists in both this object
    # and in the given data. Used during PUT operation when we're not sure
    # if the parameter is within the PUT data.
    # Otherwise do nothing.
    def maybe_set(self, name, data):
        if name in self and name in data:
            self[name] = data[name]

    @property
    def stripped(self):
        _json = self
        for key in _API_BLACK_LIST:
            if key in self:
                del _json[key]

        return _json


class Asset(MongoDict):
    @property
    def __acl__(self):
        res = [(Allow, Authenticated, ALL_PERMISSIONS)]
        # for g in self.get('groups_read', []):
        #     print 'READ GROUPS'
        #     print g
        #     res.append((Allow, 'g:{}'.format(g), 'read'))
        # for g in self.get('groups_write', []):
        #     print 'WRITE GROUPS'
        #     print g
        #     res.append((Allow, 'g:{}'.format(g), 'write'))
        return res

    def update_asset(self):
        return self.__parent__.update_asset(self)


class Item(MongoDict):
    @property
    def __acl__(self):
        return [
            #(Allow, Authenticated, ALL_PERMISSIONS),
            #(Allow, Authenticated, 'answer')
        ]

    def check_answer(self):
        return self.__parent__.check_answer(self)

    def mark_answer(self, is_correct, block_id, answer_id):
        print 'Marking some answers'
        print is_correct, block_id, answer_id
        return self.__parent__.mark_answer(self, is_correct, block_id, answer_id)

    def get_cluster_title(self):
        return self.__parent__.get_cluster_title(self.cluster_id)

    def get_next(self):
        return self.__parent__.get_next(self.cluster_id, self._id)

    def get_previous(self):
        return self.__parent__.get_previous(self.cluster_id, self._id)


class User(MongoDict):
    @property
    def __acl__(self):
        return [
            (Allow, 'g' + self.name, ALL_PERMISSIONS)
        ]

    @property
    def groups(self):
        try:
            res = MongoDict.__getitem__(self, 'groups')
            res.append(self.name)
            return res
        except KeyError:
            return list(self.name)


class Space(MongoDict):
    @property
    def __acl__(self):
        return [
            (Allow, Authenticated, ALL_PERMISSIONS)
        ]

    def create_cluster(self):
        return self.__parent__.create_cluster()


class Cluster(MongoDict):
    @property
    def __acl__(self):
        res = []
        for g in self.get('groups_read', []):
            res.append((Allow, 'g:{}'.format(g), 'read'))
        for g in self.get('groups_write', []):
            res.append((Allow, 'g:{}'.format(g), 'write'))
        return res

    def create_item(self):
        return self.__parent__.create_item()

    def get_space_title(self):
        return self.__parent__.get_space_title(self.space_id)
