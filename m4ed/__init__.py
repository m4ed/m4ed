from pyramid.config import Configurator
from pyramid.authorization import ACLAuthorizationPolicy
from pyramid.authentication import AuthTktAuthenticationPolicy

from pyramid_beaker import session_factory_from_settings

import pymongo
import redis
import zmq
import subprocess

from bson import ObjectId

from m4ed.security import groupfinder
from m4ed.util.settings import parse_asset_settings
from pyramid.renderers import JSON


def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """

    authn_policy = AuthTktAuthenticationPolicy(
        'supersecretstring',
        callback=groupfinder
    )
    authz_policy = ACLAuthorizationPolicy()

    session_factory = session_factory_from_settings(settings)

    config = Configurator(
        settings=settings,
        authentication_policy=authn_policy,
        authorization_policy=authz_policy,
        session_factory=session_factory,
        root_factory='m4ed.factories:RootFactory'
    )

    config.registry.settings['assets'] = parse_asset_settings(settings)

    if config.registry.settings['hogan.compile']:
        subprocess.call([config.registry.settings['hogan.compile']])

    # Set up the mongo connection
    mongo_host = config.registry.settings['db.mongo.host']
    mongo_port = int(config.registry.settings['db.mongo.port'])
    mongo_conn = pymongo.Connection(host=mongo_host, port=mongo_port)
    config.registry.settings['db.mongo.conn'] = mongo_conn
    config.set_request_property('m4ed.request_properties:db',
                                name='db', reify=True)
    config.set_request_property('m4ed.request_properties.fs',
                                name='fs', reify=True)

    # Set up redis connection
    redis_host = config.registry.settings['db.redis.host']
    redis_port = int(config.registry.settings['db.redis.port'])
    redis_db_num = int(config.registry.settings['db.redis.db_num'])
    config.registry.settings['db.redis.conn'] = redis.StrictRedis(
        host=redis_host, port=redis_port, db=redis_db_num)

    # Set up the shared math text parser
    config.set_request_property('m4ed.request_properties:math_text_parser',
                                name='math_text_parser', reify=True)

    config.set_request_property('m4ed.request_properties:user',
                                name='user', reify=True)

    # For debugging matplotlib
    # from matplotlib import verbose
    # verbose.level = 'debug-annoying'

    # Set up ZeroMQ work queue
    work_queue = zmq.Context().socket(zmq.PUSH)
    work_queue.connect(settings['zmq.socket'])
    config.registry.settings['zmq.work_queue'] = work_queue
    config.set_request_property('m4ed.request_properties:work_queue',
                                name='work_queue', reify=True)

    config.include('pyramid_fanstatic')
    config.include('m4ed.routes')
    config.add_static_view('static', 'static', cache_max_age=3600)

    json_renderer = JSON()
    json_renderer.add_adapter(ObjectId, lambda obj, req: str(obj))
    config.add_renderer('json', json_renderer)

    config.scan()
    return config.make_wsgi_app()
