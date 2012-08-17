from pyramid.security import Allow, Everyone, Authenticated, ALL_PERMISSIONS


class Asset(dict):
    @property
    def __acl__(self):
        res = [(Allow, Everyone, ALL_PERMISSIONS)]
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

    def __getattr__(self, key):
        attr = self.get(key, None)
        if attr is None:
            raise AttributeError(key)
        return attr


class Item(dict):
    @property
    def __acl__(self):
        return [
            #(Allow, Authenticated, ALL_PERMISSIONS)
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
