

def includeme(config):
    config.add_route('home', '/')
    config.add_route('exercise', '/e/{id}', factory='m4ed.factories:ItemFactory', traverse='/{id}')
    config.add_route('editor', '/editor', factory='m4ed.factories:ItemFactory')
    config.add_route('misaka', '/misaka')
    config.add_route('login', '/login')
    config.add_route('logout', '/logout')
    config.add_route('register', '/register')
    config.include(api, route_prefix='/api')
    config.include(learning_spaces, route_prefix='/spaces')
    config.include(learning_space, route_prefix='/s')


def learning_spaces(config):
    config.add_route('new_space', '/create', factory='m4ed.factories:SpaceFactory')


def learning_space(config):
    config.add_route('show_space', '/{id}', factory='m4ed.factories:SpaceFactory', traverse='/{id}')


def api(config):
    config.add_route('rest_items', '/items', factory='m4ed.factories:ItemFactory')
    config.include(item_api, route_prefix='/items')
    #config.include(folder_api, route_prefix='/folders')
    config.add_route('rest_assets', '/assets', factory='m4ed.factories:AssetFactory')
    config.include(asset_api, route_prefix='/assets')


def asset_api(config):
    config.add_route('rest_asset', '/{id}', factory='m4ed.factories:AssetFactory', traverse='/{id}')
    config.include(asset_api_image, route_prefix='/{id}')


def asset_api_image(config):
    config.add_route('rest_asset_thumb', '/thumb', factory='m4ed.factories:AssetFactory', traverse='/{id}')
    config.add_route('rest_asset_full_image', '/image', factory='m4ed.factories:AssetFactory', traverse='/{id}')


def item_api(config):
    config.add_route('rest_item', '/{id}', factory='m4ed.factories:ItemFactory', traverse='/{id}')
    config.add_route('rest_item_answer', '/{id}/answer', factory='m4ed.factories:ItemFactory', traverse='/{id}')
