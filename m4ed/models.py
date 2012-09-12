from pyramid.security import Allow, Everyone, Authenticated, ALL_PERMISSIONS


class MongoDict(dict):

    reserved_names = ['__name__', '__parent__']

    def __init__(self, _init):
        dict.__init__(self)
        self.update(_init)

    def __getattr__(self, name):
        if name in self.reserved_names:
            return dict.__getattr__(self, name)
        try:
            return dict.__getitem__(self, name)
        except KeyError:
            raise AttributeError

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
            raise AttributeError

    def save(self):
        self.__parent__.save(self)


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


class Item(MongoDict):
    @property
    def __acl__(self):
        return [
            (Allow, Authenticated, ALL_PERMISSIONS)
        ]

    def __init__(self, init_data, name=None, parent=None):
        #super(Item, self).__init__(self)
        #self.update(a_dict)
        self.__name__ = name
        self.__parent__ = parent
        MongoDict.__init__(self, init_data)
        # Make sure the ObjectId is json seriablable
        self['_id'] = str(self['_id'])

    def save(self):
        self.__parent__.save(self)

    def check_answer(self, block_id, answer_id):
        #print 'Checking some answers'
        #print self
        answers = self.get('answers', None)
        is_correct = False
        if answers:
            block_answers = answers.get(block_id, None)
            if not block_answers:
                pass
            elif isinstance(block_answers, list):
                if answer_id in block_answers:
                    is_correct = True
            else:
                print 'WE DONT KNOW WHAT TO DO NEXT'
        self.mark_answer(is_correct, block_id, answer_id)
        return is_correct
        #(block_id, answer_id)

    def mark_answer(self, is_correct, block_id, answer_id):
        print 'Marking some answers'
        print is_correct, block_id, answer_id
        self.__parent__.mark_answer(self, is_correct, block_id, answer_id)


class User(MongoDict):
    @property
    def __acl__(self):
        return [
            (Allow, 'g' + self.name, ALL_PERMISSIONS)
        ]

    def __init__(self, init_data, name=None, parent=None):
        MongoDict.__init__(self, init_data)
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
        MongoDict.__init__(self, init_data)
