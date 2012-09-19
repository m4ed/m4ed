from gridfs import GridFS
from matplotlib.mathtext import MathTextParser

from pyramid.security import unauthenticated_userid

from m4ed.models import User


def db(request):
    settings = request.registry.settings
    db_name = settings['db.mongo.collection_name']
    db_conn = settings['db.mongo.conn']
    return db_conn[db_name]


def fs(request):
    # This relies on the db property to be set
    return GridFS(request.db)


def work_queue(request):
    return request.registry.settings['zmq.work_queue']


def misaka(request):
    return request.registry.settings['misaka']


def math_text_parser(request):
    return MathTextParser('bitmap')


def user(request):
    userid = unauthenticated_userid(request)
    if userid is not None:
        user = request.db.users.find_one({'username': userid})
        if user is not None:
            return User(user)
