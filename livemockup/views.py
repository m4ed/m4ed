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
        # buttonGroups=[
        #     [dict(
        #         icon='h1',
        #         callback=dict(
        #             action='span',
        #             data=dict(
        #               prefix='# ',
        #                suffix='',
        #                text='Heading 1'
        #             )
        #         )
        #     ),
        #     dict(
        #         icon='h2',
        #         callback=dict(
        #             action='span',
        #             data=dict(
        #               prefix='## ',
        #                suffix='',
        #                text='Heading 2'
        #             )
        #         )

        #     ),
        #     dict(
        #         icon='h3',
        #         callback=dict(
        #             action='span',
        #             data=dict(
        #               prefix='### ',
        #                suffix='',
        #                text='Heading 3'
        #             )
        #         )

        #     )],
        #     [dict(
        #         icon='bold',
        #         callback=dict(
        #             action='span',
        #             data=dict(
        #                 prefix='**',
        #                 suffix='**',
        #                 text='strong text'
        #             )
        #         )
        #     ),
        #     dict(
        #         icon='italic',
        #         callback=dict(
        #             action='span',
        #             data=dict(
        #                prefix='_',
        #                suffix='_',
        #                text='italic text'
        #             )
        #         )
        #     ),
        #     dict(
        #         icon='link',
        #         callback=dict(
        #             action='span',
        #             data=dict(
        #                 prefix='[',
        #                 suffix='](http://www.example.com)',
        #                 text='link text'
        #             )
        #         )
        #     )],
        #     [dict(
        #         icon='list',
        #         callback=dict(
        #             action='list',
        #             data=dict(
        #                 prefix='* ',
        #                 suffix='',
        #                 wrap=True
        #             )
        #         )
        #     ),
        #     dict(
        #         icon='numbered-list',
        #         callback=dict(
        #             action='list',
        #             data=dict(
        #                 prefix='0. ',
        #                 suffix='',
        #                 wrap=True,
        #                 regex='^\s*\d+\.\s'
        #             )
        #         )
        #     )],
        #     [dict(
        #         icon='quote',
        #         callback=dict(
        #             action='list',
        #             data=dict(
        #                 prefix='> ',
        #                 wrap=True
        #             )
        #         )

        #     ),
        #     dict(
        #         icon='code',
        #         callback=dict(
        #             action='block',
        #             data=dict(
        #                 prefix='    ',
        #                 wrap=True
        #             )
        #         )
        #     )]
        # ]
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

    images = []
    for i in range(0, 20):
        images.append({
            '_id': i,
            'title': 'Test {}'.format(i),
            'desc': 'Description for asset {}'.format(i),
            'src': 'http://placehold.it/150x100'
        })

    return images


@view_config(route_name='misaka', renderer='json', request_method='POST')
def POST_misaka(request):
    text = request.params.get('md', '')
    renderer = MathRenderer()
    md = misaka.Markdown(renderer, extensions=misaka.EXT_TABLES)
    html = md.render(text)
    return {
        'html': html
    }
