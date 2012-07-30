from pyramid.decorator import reify
from pyramid.request import Request

from gridfs import GridFS


class CustomRequestFactory(Request):
    """ Add db, fs and user variables to every request.
    """

    @reify
    def db(self):
        settings = self.registry.settings
        db_name = settings['db_name']
        db_conn = settings['db_conn']
        return db_conn[db_name]

    @reify
    def fs(self):
        return GridFS(self.db)

    # @reify
    # def user(self):
    #     userid = unauthenticated_userid(self)
    #     if userid is not None:
    #         user = self.db.users.find_one({'userid': userid}) or {}
    #         return User(user)
