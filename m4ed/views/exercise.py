
from pyramid.view import view_config
from m4ed.htmlrenderer import CustomHtmlRenderer
from misaka import (
    Markdown,
    EXT_TABLES
    )


@view_config(route_name='exercise', renderer='home.mako')
def getto(request):
    renderer = CustomHtmlRenderer(settings=request.registry.settings)
    misaka_renderer = Markdown(renderer=renderer, extensions=EXT_TABLES)
    html = misaka_renderer.render(request.context.text)
    return {
        'e': html
    }
