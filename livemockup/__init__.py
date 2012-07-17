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
    config.add_route('api_items', '/api/items/:id')
    config.scan()
    return config.make_wsgi_app()
