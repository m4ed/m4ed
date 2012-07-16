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
