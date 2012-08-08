from pyramid.config import Configurator

import pymongo
import redis

from htmlrenderer import CustomHtmlRenderer
from misaka import Markdown, EXT_TABLES

from .request import CustomRequestFactory
from .factories import AssetFactory, ItemFactory


def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    config = Configurator(
        settings=settings,
        request_factory=CustomRequestFactory
        )

    # Set up the mongo connection
    mongo_host = config.registry.settings['db.mongo.host']
    mongo_port = int(config.registry.settings['db.mongo.port'])
    config.registry.settings['db.mongo.conn'] = pymongo.Connection(host=mongo_host, port=mongo_port)
    # Set up redis connection
    redis_host = config.registry.settings['db.redis.host']
    redis_port = int(config.registry.settings['db.redis.port'])
    redis_db_num = int(config.registry.settings['db.redis.db_num'])
    config.registry.settings['db.redis.conn'] = redis.StrictRedis(
        host=redis_host, port=redis_port, db=redis_db_num)

    # Set up the misaka Markdown renderer
    renderer = CustomHtmlRenderer(settings=config.registry.settings)
    config.registry.settings['misaka'] = Markdown(renderer=renderer, extensions=EXT_TABLES)

    config.include('pyramid_fanstatic')
    config.add_static_view('static', 'static', cache_max_age=3600)
    config.add_route('home', '/pyramid')
    config.add_route('editor', '/', factory=ItemFactory)
    config.add_route('misaka', '/misaka')
    config.include(api, route_prefix='/api')
    config.scan()
    return config.make_wsgi_app()


def api(config):
    config.include(item_api, route_prefix='/items')
    #config.include(folder_api, route_prefix='/folders')
    config.include(asset_api, route_prefix='/assets')


def asset_api(config):
    config.add_route('rest_asset', '/{id}', factory=AssetFactory, traverse='/{id}')
    config.add_route('rest_assets', '/', factory=AssetFactory)


def item_api(config):
    config.add_route('rest_item', '/{id}', factory=ItemFactory, traverse='/{id}')
    config.add_route('rest_items', '/', factory=ItemFactory)


# def folder_api(config):
#     config.add_route('rest_folders', '/:id')
