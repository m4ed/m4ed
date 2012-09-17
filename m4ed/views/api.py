from pyramid.view import (
    view_config,
    view_defaults
    )

from pyramid.httpexceptions import (
    HTTPSeeOther,
    HTTPNotAcceptable
    )

from pyramid.security import authenticated_userid

from bson import ObjectId

from misaka import (
    Markdown,
    EXT_TABLES
    )

from m4ed.htmlrenderer import CustomHtmlRenderer


@view_config(route_name='rest_asset_thumb')
def get_asset_thumb(request):
    return HTTPSeeOther(location=request.context.get('thumbnail_url'))


@view_config(route_name='rest_asset_full_image')
def get_asset_url(request):
    return HTTPSeeOther(location=request.context.get('url'))


@view_defaults(route_name='rest_item', renderer='json')
class ItemView(object):
    def __init__(self, request):
        self.request = request

    @view_config(request_method='GET', permission='read')
    def get(self):
        # if not self.request.context:
        #     self.request.response.status = '404'
        #     return {}
        return self.request.context

    # @view_config(request_method='POST', permission='write')
    # def post(self):
    #     return {'result': 'POST accepted'}

    @view_config(request_method='PUT', permission='write')
    def put(self):
        try:
            kwargs = self.request.json_body
        except ValueError:
            # If we get a value error, the request didn't have a json body
            # Ignore the request
            return HTTPNotAcceptable()
        update = self.request.context

        if not kwargs.pop('_id', None):
            self.request.response.status = '503'
            return {}
        update['listIndex'] = kwargs.pop('listIndex')
        update['title'] = kwargs.pop('title')
        update['desc'] = kwargs.pop('desc')
        update['tags'] = kwargs.pop('tags')
        update['text'] = kwargs.pop('text')

        renderer = CustomHtmlRenderer(
            math_text_parser=self.request.math_text_parser,
            settings=self.request.registry.settings,
            mongo_db=self.request.db,
            #cloud=True,
            #work_queue=self.request.work_queue
            )
        misaka_renderer = Markdown(renderer=renderer, extensions=EXT_TABLES)
        update['html'] = misaka_renderer.render(update['text'])

        update['answers'] = renderer.get_answers()

        update.save()

        self.request.response.status = '200'
        return {}

    @view_config(request_method='DELETE', permission='write')
    def delete(self):
        # try:
        #     kwargs = self.request.json_body
        # except ValueError:
        #     # If we get a value error, the request didn't have a json body
        #     # Ignore the request
        #     return HTTPNotAcceptable()

        # if not kwargs.pop('_id', None):
        #     self.request.response.status = '503'
        #     return {}

        self.request.context.remove()

        # update['listIndex'] = kwargs.pop('listIndex')
        # update['title'] = kwargs.pop('title')
        # update['desc'] = kwargs.pop('desc')
        # update['tags'] = kwargs.pop('tags')
        # update['text'] = kwargs.pop('text')

        # renderer = CustomHtmlRenderer(
        #     math_text_parser=self.request.math_text_parser,
        #     settings=self.request.registry.settings,
        #     mongo_db=self.request.db,
        #     #cloud=True,
        #     #work_queue=self.request.work_queue
        #     )
        # misaka_renderer = Markdown(renderer=renderer, extensions=EXT_TABLES)
        # update['html'] = misaka_renderer.render(update['text'])

        # update['answers'] = renderer.get_answers()

        # update.save()

        self.request.response.status = '200'
        return {}


@view_config(
    route_name='rest_item_answer',
    request_method='POST',
    permission='answer',
    renderer='json'
    )
def post_item_answer(self, request):
    block_id = request.params.get('block_id')
    answer_id = request.params.get('answer_id')
    res = 'incorrect'
    try:
        block_id = block_id.split('-')[1]
        #block_id = full_id[1]
        #answer_id = full_id[2]
        print block_id, answer_id
        result = request.context.check_answer(block_id, answer_id)
        if result == True:
            res = 'correct'

    except IndexError:
        pass
    return {'I': 'See what you did there', 'res': res}


@view_defaults(route_name='rest_items', renderer='json')
class ItemsView(object):

    def __init__(self, request):
        self.request = request

    @view_config(request_method='GET', permission='read')
    def get(self):
        res = []
        for item in self.request.context:
            res.append(item)
        return res

    @view_config(request_method='POST')
    def post(self):

        try:
            # This fails if the post is some sort of form instead of json
            kwargs = self.request.json_body
        except ValueError:
            # If we get a value error, the request didn't have a json body
            # Ignore the request
            return HTTPNotAcceptable()

        item = {}

        item['title'] = kwargs.pop('title', 'Click to add a title')
        item['desc'] = kwargs.pop('desc', 'Click to add a description')
        item['text'] = kwargs.pop('text', '')
        item['tags'] = kwargs.pop('tags', [])
        item['listIndex'] = kwargs.pop('listIndex', 0)

        item_id = self.request.db.items.insert(item, safe=True)
        item_id = str(item_id)

        item['_id'] = item_id

        print 'POST: Item added witd id ' + item_id
        self.request.response.status = '200'
        return item

    @view_config(request_method='PUT')
    def put(self):
        return {'result': 'PUT accepted'}

    @view_config(request_method='DELETE')
    def delete(self):
        return {'result': 'DELETE accepted'}


# @view_defaults(route_name='rest_folders', renderer='json')
# class RESTFoldersView(object):
#     def __init__(self, request):
#         self.request = request

#     @view_config(request_method='GET')
#     def get(self):
#         return self.request.context


@view_defaults(route_name='rest_asset', renderer='json')
class AssetView(object):
    def __init__(self, request):
        self.request = request

    @view_config(request_method='GET', permission='read')
    def get(self):
        #print 'We don\'t get here'
        return self.request.context

    @view_config(request_method='PUT')
    def put(self):
        # if not self.request.context:
        #     self.request.status = '404'
        #     return {}
        try:
            kwargs = self.request.json_body
        except ValueError:
            # If we get a value error, the request didn't have a json body
            # Ignore the request
            return HTTPNotAcceptable('Send JSON.')
        update = {}

        if not kwargs.pop('_id', None):
            # Internal Server Error
            self.request.response.status = '500'
            return {}
        update['title'] = kwargs.pop('title')
        update['tags'] = kwargs.pop('tags')

        asset = self.request.context
        asset.update(update)
        _id = asset.get('_id')
        # We can't update the mongo ObjectId so pop it
        asset.pop('_id')
        asset.pop('id')

        self.request.context = self.request.db.assets.find_and_modify(
            query={'_id': ObjectId(_id)},
            update={'$set': asset},
            upsert=True,
            safe=True
        )

        self.request.response.status = '200'
        return {}

    @view_config(request_method='DELETE')
    def delete(self):
        _id = self.request.context.get('_id')
        self.request.work_queue.send('delete:' + str(_id))
        return {'result': 'done'}


@view_defaults(route_name='rest_assets', renderer='json')
class AssetsView(object):
    def __init__(self, request):
        self.request = request

    @view_config(request_method='GET', permission='read')
    def get(self):
        res = []
        for asset in self.request.context:
            res.append(asset)
        return res

    @view_config(request_method='POST', permission='write')
    def post(self):
        request = self.request
        #print request.session
        if not authenticated_userid(request):
            return {'result': 'error', 'why': 'diaf'}

        post_param = dict(request.POST)
        print post_param

        file_path = post_param.get('path')
        settings = request.registry.settings['assets']

        if file_path and file_path.startswith(settings['tmp_path']):
            #if not settings['store_locally']:
            request.work_queue.send_string('save:' + file_path)

        #del data['_id']
        return [dict(result='saa')]
