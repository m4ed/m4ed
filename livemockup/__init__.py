from pyramid.config import Configurator


def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    config = Configurator(settings=settings)
    config.include('pyramid_fanstatic')
    config.add_static_view('static', 'static', cache_max_age=3600)
    config.add_route('home', '/pyramid')
    config.add_route('editor', '/')
    config.add_route('misaka', '/misaka')
    config.include(api, route_prefix='/api')
    config.scan()
    return config.make_wsgi_app()


def api(config):
    config.include(item_api, route_prefix='/items')
    config.include(folder_api, route_prefix='/folders')
    config.add_route('api_all_media', '/media')
    config.include(media_api, route_prefix='/media')


def item_api(config):
    config.add_route('api_items', '/:id')


def folder_api(config):
    config.add_route('api_folders', '/:id')


def media_api(config):
    config.add_route('api_media', '/:id')
