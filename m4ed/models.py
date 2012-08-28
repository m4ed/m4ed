from pyramid.security import Allow, Everyone, Authenticated, ALL_PERMISSIONS


class Asset(dict):
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

    def __getattr__(self, name):
        attr = self.get(name, None)
        if attr is None:
            raise AttributeError(name)
        return attr


class Item(dict):
    @property
    def __acl__(self):
        return [
            (Allow, Authenticated, ALL_PERMISSIONS)
        ]

    def __init__(self, a_dict, name=None, parent=None):
        super(Item, self).__init__(self)
        self.update(a_dict)
        # Make sure the ObjectId is json seriablable
        self['_id'] = str(self['_id'])
        self.__name__ = name
        self.__parent__ = parent

    def __getattr__(self, name):
        attr = self.get(name, None)
        if attr is None:
            raise AttributeError(name)
        return attr


class User(dict):
    @property
    def __acl__(self):
        return [
            (Allow, 'g' + self.name, ALL_PERMISSIONS)
        ]

    def __init__(self, dict_with_the_data, name=None, parent=None):
        dict.__init__(self)
        if dict_with_the_data:
            self.update(dict_with_the_data)
        self.__name__ = name
        self.__parent__ = parent

    @property
    def groups(self):
        try:
            res = dict.__getitem__(self, 'groups')
            res.append(self.name)
            return res
        except KeyError:
            return list(self.name)

    def save(self):
        self.__parent__.save(self)

    def __getattr__(self, name):
        try:
            return dict.__getitem__(self, name)
        except KeyError:
            raise AttributeError

    def __setattr__(self, name, value):
        dict.__setitem__(self, name, value)

    def __delattr__(self, name):
        try:
            dict.__delitem__(self, name)
        except KeyError:
            raise AttributeError
