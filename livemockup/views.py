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
        dict(title='Lesson 1', exercises=['Exercise 1', 'Exercise 2']),
        dict(title='Lesson 2', exercises=['Exercise 1', 'Exercise 2', 'Exercise 3']),
        dict(title='Lesson 3', exercises=['Exercise 1'])
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
        markdown='# Heading 1\n\n## Heading 2'
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
            {'_id': '2', 'title': 'Test 2', 'src': 'http://placehold.it/150x100'}
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
