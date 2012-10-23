

def includeme(config):
    config.add_route('index', '/', factory='m4ed.factories:SpaceFactory')
    config.add_route('edit_index', '/edit', factory='m4ed.factories:SpaceFactory')
    config.add_route('editor', '/editor', factory='m4ed.factories:ItemFactory')
    config.add_route('misaka', '/misaka')
    config.add_route('login', '/login', factory='m4ed.factories:UserFactory')
    config.add_route('logout', '/logout')
    config.add_route('register', '/register', factory='m4ed.factories:UserFactory')
    config.include(api, route_prefix='/api')
    config.include(learning_space, route_prefix='/s')
    config.include(cluster, route_prefix='/c')
    config.include(item, route_prefix='/i')
    # config.include(learning_spaces, route_prefix='/spaces')
    #config.include(clusters, route_prefix='/clusters')


# def learning_spaces(config):
#     config.add_route('new_space', '/create', factory='m4ed.factories:SpaceFactory')


def learning_space(config):
    config.add_route('space', '/{space_id}', factory='m4ed.factories:SpaceFactory', traverse='/{space_id}')
    config.add_route('edit_space', '/{space_id}/edit', factory='m4ed.factories:SpaceFactory', traverse='/{space_id}')


def cluster(config):
    config.add_route('cluster', '/{cluster_id}', factory='m4ed.factories:ClusterFactory', traverse='/{cluster_id}')
    config.add_route('edit_cluster', '/{cluster_id}/edit', factory='m4ed.factories:ClusterFactory', traverse='/{cluster_id}')


def item(config):
    config.add_route('preview_item', '/{item_id}/preview', factory='m4ed.factories:ItemFactory', traverse='/{item_id}')
    config.add_route('item', '/{item_id}', factory='m4ed.factories:ItemFactory', traverse='/{item_id}')
    config.add_route('item_mini', '/{item_id}.mini', factory='m4ed.factories:ItemFactory', traverse='/{item_id}')


def api(config):
    config.add_route('rest_login', '/login', factory='m4ed.factories:UserFactory')
    config.add_route('rest_signup', '/signup', factory='m4ed.factories:UserFactory')
    config.add_route('rest_spaces', '/spaces', factory='m4ed.factories:SpaceFactory')
    config.include(space_api, route_prefix='/spaces')

    # config.add_route('rest_clusters', '/clusters', factory='m4ed.factories:ClusterFactory')
    config.include(cluster_api, route_prefix='/clusters')

    # config.add_route('rest_items', '/items', factory='m4ed.factories:ItemFactory')
    config.include(item_api, route_prefix='/items')

    config.add_route('rest_assets', '/assets', factory='m4ed.factories:AssetFactory')
    config.include(asset_api, route_prefix='/assets')


def space_api(config):
    config.add_route('rest_space', '/{space_id}', factory='m4ed.factories:SpaceFactory', traverse='/{space_id}')
    config.add_route('rest_space_clusters', '/{space_id}/clusters', factory='m4ed.factories:SpaceFactory', traverse='/{space_id}')


def cluster_api(config):
    config.add_route('rest_cluster', '/{cluster_id}', factory='m4ed.factories:ClusterFactory', traverse='/{cluster_id}')
    config.add_route('rest_cluster_items', '/{cluster_id}/items', factory='m4ed.factories:ClusterFactory', traverse='/{cluster_id}')


def item_api(config):
    config.add_route('rest_item', '/{id}', factory='m4ed.factories:ItemFactory', traverse='/{id}')
    config.add_route('rest_item_answer', '/{id}/answer', factory='m4ed.factories:ItemFactory', traverse='/{id}')


def asset_api(config):
    config.add_route('rest_asset', '/{id}', factory='m4ed.factories:AssetFactory', traverse='/{id}')
    config.include(asset_api_image, route_prefix='/{id}')


def asset_api_image(config):
    config.add_route('rest_asset_thumb', '/thumb', factory='m4ed.factories:AssetFactory', traverse='/{id}')
    config.add_route('rest_asset_full_image', '/image', factory='m4ed.factories:AssetFactory', traverse='/{id}')
