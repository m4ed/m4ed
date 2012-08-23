

def includeme(config):
    config.add_route('home', '/pyramid')
    config.add_route('editor', '/', factory='m4ed.factories:ItemFactory')
    config.add_route('misaka', '/misaka')
    config.add_route('login', '/login')
    config.add_route('logout', '/logout')
    config.add_route('register', '/register')
    config.include(api, route_prefix='/api')


def api(config):
    config.add_route('rest_items', '/items', factory='m4ed.factories:ItemFactory')
    config.include(item_api, route_prefix='/items')
    #config.include(folder_api, route_prefix='/folders')
    config.add_route('rest_assets', '/assets', factory='m4ed.factories:AssetFactory')
    config.include(asset_api, route_prefix='/assets')


def asset_api(config):
    config.add_route('rest_asset', '/{id}', factory='m4ed.factories:AssetFactory', traverse='/{id}')
    config.include(asset_image, route_prefix='/{id}')


def asset_image(config):
    config.add_route('rest_asset_thumb', '/thumb', factory='m4ed.factories:AssetFactory', traverse='/{id}')
    config.add_route('rest_asset_full_image', '/image', factory='m4ed.factories:AssetFactory', traverse='/{id}')


def item_api(config):
    config.add_route('rest_item', '/{id}', factory='m4ed.factories:ItemFactory', traverse='/{id}')
