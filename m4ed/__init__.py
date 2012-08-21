from pyramid.config import Configurator
from pyramid.authorization import ACLAuthorizationPolicy
from pyramid.authentication import AuthTktAuthenticationPolicy

from pyramid_beaker import session_factory_from_settings

import pymongo
import redis

from htmlrenderer import CustomHtmlRenderer
from misaka import Markdown, EXT_TABLES

from .security import groupfinder


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

    # Set up the mongo connection
    mongo_host = config.registry.settings['db.mongo.host']
    mongo_port = int(config.registry.settings['db.mongo.port'])
    mongo_conn = pymongo.Connection(host=mongo_host, port=mongo_port)
    config.registry.settings['db.mongo.conn'] = mongo_conn

    config.set_request_property(
        lambda req:
            req.registry.settings['db.mongo.conn'][
                req.registry.settings['db.mongo.collection_name']
            ],
        name='db', reify=True)

    # Set up redis connection
    redis_host = config.registry.settings['db.redis.host']
    redis_port = int(config.registry.settings['db.redis.port'])
    redis_db_num = int(config.registry.settings['db.redis.db_num'])
    config.registry.settings['db.redis.conn'] = redis.StrictRedis(
        host=redis_host, port=redis_port, db=redis_db_num)

    # Set up the misaka Markdown renderer
    renderer = CustomHtmlRenderer(settings=config.registry.settings)
    config.registry.settings['misaka'] = Markdown(renderer=renderer, extensions=EXT_TABLES)
    config.set_request_property(
        lambda req: req.registry.settings['misaka'], name='misaka', reify=True)

    config.include('pyramid_fanstatic')
    config.add_static_view('static', 'static', cache_max_age=3600)
    config.add_route('home', '/pyramid')
    config.add_route('editor', '/', factory='m4ed.factories:ItemFactory')
    config.add_route('misaka', '/misaka')
    config.add_route('login', '/login')
    config.add_route('logout', '/logout')
    config.include(api, route_prefix='/api')
    config.scan()
    return config.make_wsgi_app()


def api(config):
    config.add_route('rest_items', '/items', factory='m4ed.factories:ItemFactory')
    config.include(item_api, route_prefix='/items')
    #config.include(folder_api, route_prefix='/folders')
    config.add_route('rest_assets', '/assets', factory='m4ed.factories:AssetFactory')
    config.include(asset_api, route_prefix='/assets')


def asset_api(config):
    config.add_route('rest_asset', '/{id}', factory='m4ed.factories:AssetFactory', traverse='/{id}')
    config.add_route('rest_asset_thumb', '/{id}/thumb', factory='m4ed.factories:AssetFactory', traverse='/{id}')
    config.add_route('rest_asset_full_image', '/{id}/image', factory='m4ed.factories:AssetFactory', traverse='/{id}')


def item_api(config):
    config.add_route('rest_item', '/{id}', factory='m4ed.factories:ItemFactory', traverse='/{id}')


# def folder_api(config):
#     config.add_route('rest_folders', '/:id')
