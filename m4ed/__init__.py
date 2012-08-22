from pyramid.config import Configurator
from pyramid.authorization import ACLAuthorizationPolicy
from pyramid.authentication import AuthTktAuthenticationPolicy

from pyramid_beaker import session_factory_from_settings

import pymongo
import redis
import zmq

from htmlrenderer import CustomHtmlRenderer
from misaka import Markdown, EXT_TABLES

from .security import groupfinder
from .util.settings import parse_asset_settings


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
        root_factory='.factories:RootFactory'
    )

    config.registry.settings['assets'] = parse_asset_settings(settings)

    # Set up the mongo connection
    mongo_host = config.registry.settings['db.mongo.host']
    mongo_port = int(config.registry.settings['db.mongo.port'])
    mongo_conn = pymongo.Connection(host=mongo_host, port=mongo_port)
    config.registry.settings['db.mongo.conn'] = mongo_conn
    config.set_request_property('.request_properties:db',
                                name='db', reify=True)
    config.set_request_property('.request_properties.fs',
                                name='fs', reify=True)

    # Set up redis connection
    redis_host = config.registry.settings['db.redis.host']
    redis_port = int(config.registry.settings['db.redis.port'])
    redis_db_num = int(config.registry.settings['db.redis.db_num'])
    config.registry.settings['db.redis.conn'] = redis.StrictRedis(
        host=redis_host, port=redis_port, db=redis_db_num)

    # Set up the misaka Markdown renderer
    renderer = CustomHtmlRenderer(settings=config.registry.settings)
    config.registry.settings['misaka'] = Markdown(renderer=renderer,
                                                  extensions=EXT_TABLES)
    config.set_request_property('.request_properties:misaka',
                                name='misaka', reify=True)

    # Set up ZeroMQ work queue
    work_queue = zmq.Context().socket(zmq.PUSH)
    work_queue.connect(settings['zmq.socket'])
    config.registry.settings['zmq.work_queue'] = work_queue
    config.set_request_property('.request_properties:work_queue',
                                name='work_queue', reify=True)

    config.include('pyramid_fanstatic')
    config.include('.routes')
    config.add_static_view('static', 'static', cache_max_age=3600)

    config.scan()
    return config.make_wsgi_app()