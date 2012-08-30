from pyramid.view import view_config
from pyramid.security import (
    authenticated_userid
    )
from m4ed.resources import editor_less
from m4ed.htmlrenderer import CustomHtmlRenderer
from misaka import (
    Markdown,
    EXT_TABLES
    )


# This should have permission='read'
@view_config(route_name='editor', renderer='editor/editor.mako')
def editor(request):
    # Include .less
    #request.session['wakalaka'] = 'yep'
    editor_less.need()
    return {
        'project': 'm4ed',
        'items': request.context
    }


@view_config(route_name='misaka', renderer='json', request_method='POST')
def misaka(request):
    if not authenticated_userid(request):
        request.response.status = 403
        return {'status': 'error', 'reason': 'forbidden'}
    text = request.params.get('md', '')

    renderer = CustomHtmlRenderer(settings=request.registry.settings)
    html = Markdown(renderer=renderer, extensions=EXT_TABLES).render(text)
    return {
        'html': html
    }
