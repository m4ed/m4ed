from pyramid.view import view_config
from livemockup.resources import editor_less
import misaka
from mathrenderer import MathRenderer


@view_config(route_name='home', renderer='templates/mytemplate.pt')
def home(request):
    return {'project': 'livemockup'}


@view_config(route_name='editor', renderer='editor.mako')
def editor(request):
    # Include .less
    editor_less.need()
    # Dummy items
    lessons = [
        dict(title='Lesson 1', description='This is a description', exercises=['Exercise 1', 'Exercise 2']),
        dict(title='Lesson 2', description='This is a description', exercises=['Exercise 1', 'Exercise 2', 'Exercise 3']),
        dict(title='Lesson 3', description='This is a description', exercises=['Exercise 1'])
    ]

    return {
        'project': 'm4ed',
        'lessons': lessons
    }


@view_config(route_name='api_items', renderer='json')
def GET_api_items(request):
    _id = request.matchdict['id']
    print _id
    return dict(
        _id=_id,
        text='This is text for item ID: {}'.format(_id),
        title='Item {}'.format(_id),
        description='This is a description',
        buttons=[{
            'class': '',
            'display': 'block',
            'icon': 'h1',
            'callback': {
                'action': 'span',
                'data':{
                  'prefix': '# ',
                   'suffix': '',
                   'text': 'Heading 1'
                }
            }
        }]
    )


@view_config(route_name='api_folders', renderer='json')
def GET_api_folders(request):
    _id = request.matchdict['id']
    return dict(
        _id=_id,
        title='A folder with _id {}.'.format(_id),
        #images=['http://placehold.it/150x100'] * 6,
        description='This is a description'
        )


@view_config(route_name='api_media', renderer='json')
def GET_api_media(request):
    return dict(
        images=[
            {'title': 'Test 1', 'src': 'http://placehold.it/150x100'},
            {'title': 'Test 2', 'src': 'http://placehold.it/150x100'}
        ],
    )


@view_config(route_name='api_all_media', renderer='json')
def GET_api_all_media(request):
    return [
            {'_id': '1', 'title': 'Test 1', 'src': 'http://placehold.it/150x100'},
            {'_id': '2', 'title': 'Test 2', 'src': 'http://placehold.it/150x100'},
            {'_id': '3', 'title': 'Test 3', 'src': 'http://placehold.it/150x100'},
            {'_id': '4', 'title': 'Test 4', 'src': 'http://placehold.it/150x100'},
            {'_id': '5', 'title': 'Test 5', 'src': 'http://placehold.it/150x100'},
            {'_id': '6', 'title': 'Test 6', 'src': 'http://placehold.it/150x100'},
            {'_id': '7', 'title': 'Test 7', 'src': 'http://placehold.it/150x100'},
            {'_id': '8', 'title': 'Test 8', 'src': 'http://placehold.it/150x100'}
    ]


@view_config(route_name='misaka', renderer='json', request_method='POST')
def POST_misaka(request):
    text = request.params.get('md', '')
    print text
    renderer = MathRenderer()
    md = misaka.Markdown(renderer, extensions=misaka.EXT_TABLES)
    html = md.render(text)
    return {
        'html': html
    }
