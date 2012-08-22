from pyramid.view import notfound_view_config


@notfound_view_config(append_slash=True, renderer='404.mako')
def notfound(request):
    request.response.status = '404'
    return {}
