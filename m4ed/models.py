from pyramid.security import (
    Allow,
    Everyone,
    Authenticated,
    ALL_PERMISSIONS,
    DENY_ALL
    )


class MongoDict(dict):

    reserved_names = ['__name__', '__parent__']

    def __init__(self, init_data, name=None, parent=None):
        dict.__init__(self)
        self.update(init_data)
        self.__name__ = name
        self.__parent__ = parent

    def __getattr__(self, name):
        if name in self.reserved_names:
            return dict.__getattr__(self, name)
        try:
            return dict.__getitem__(self, name)
        except KeyError:
            raise AttributeError('The item has no attribute {}'.format(name))

    def __setattr__(self, name, value):
        if name in self.reserved_names:
            dict.__setattr__(self, name, value)
        else:
            dict.__setitem__(self, name, value)

    def __delattr__(self, name):
        if name in self.reserved_names:
            dict.__delattr__(self, name)
            return
        try:
            dict.__delitem__(self, name)
        except KeyError:
            raise AttributeError('The item has no attribute "{}"'.format(name))

    def save(self):
        if not self.is_valid():
            return
        self.__parent__.save(self)

    def remove(self):
        self.__parent__.remove(self)


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

    def __init__(self, a_dict, name=None, parent=None):
        super(Asset, self).__init__(self)
        self.update(a_dict)
        # Make sure the ObjectId is json seriablable
        self['_id'] = str(self['_id'])
        self.__name__ = name
        self.__parent__ = parent

    def update_asset(self):
        return self.__parent__.update_asset(self)




class Item(MongoDict):
    @property
    def __acl__(self):
        return [
            #(Allow, Authenticated, ALL_PERMISSIONS),
            #(Allow, Authenticated, 'answer')
        ]

    def __init__(self, init_data, name=None, parent=None):
        #super(Item, self).__init__(self)
        #self.update(a_dict)
        MongoDict.__init__(self, init_data, name, parent)
        # Make sure the ObjectId is json seriablable
        self._id = str(self._id)
        self.cluster_id = str(self.cluster_id)

    def save(self):
        return self.__parent__.save(self)

    def update_item(self):
        return self.__parent__.update_item(self)

    def check_answer(self):
        return self.__parent__.check_answer(self)

    def mark_answer(self, is_correct, block_id, answer_id):
        print 'Marking some answers'
        print is_correct, block_id, answer_id
        return self.__parent__.mark_answer(self, is_correct, block_id, answer_id)


class User(MongoDict):
    @property
    def __acl__(self):
        return [
            (Allow, 'g' + self.name, ALL_PERMISSIONS)
        ]

    def __init__(self, init_data, name=None, parent=None):
        MongoDict.__init__(self, init_data, name, parent)
        self.__name__ = name
        self.__parent__ = parent

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

    def __init__(self, init_data, name=None, parent=None):
        MongoDict.__init__(self, init_data, name, parent)

    def is_valid(self):
        #validator = get_validator()
        #return validator.is_valid(self)
        return True

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

    def __init__(self, init_data, name=None, parent=None):
        MongoDict.__init__(self, init_data, name, parent)
        self.space_id = str(self.space_id)
