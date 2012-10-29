
from pyramid.view import view_config

from m4ed.resources import student_less, preview_less

from pprint import pprint

@view_config(
    route_name='item',
    renderer='student/item.mako',
    permission='read')
def get_item(request):
    student_less.need()

    resources = request.context.stripped
    item = resources.item
    cluster = resources.cluster
    space = resources.space
    navi = resources.navi
    print "\033[31m item:"
    pprint(item)
    print "\033[32m cluster:"
    pprint(cluster)
    print "\033[33m space:"
    pprint(space)
    print "\033[34m navi:"
    pprint(navi)
    print "\033[0m"

    print "HOLA"
    print resources
    print item
    if not item.html:
        item.html = ''
    # return {
    #     'item': item,
    #     'cluster_title': request.context.cluster_title, #get_cluster_title(),
    #     'next_id': request.context.get_next(),
    #     'prev_id': request.context.get_previous()
    # }
    return {
        'item': item,
        'cluster_title': cluster.title,
        'next_id': navi.next,
        'prev_id': navi.prev
    }


@view_config(
    route_name='preview_item',
    renderer='editor/preview.mako',
    permission='write')
def get_preview_item(request):
    preview_less.need()
    resources = request.context.stripped
    item = resources.item
    if not item.html:
        item.html = ''
    return {
        'item': item
    }


# @view_config(route_name='item_mini', renderer='mini/item.mako', permission='read')
# @view_config(route_name='item', renderer='medium/item.mako', permission='read')
# def get_exercise(request):
#     student_less.need()

#     try:
#         html = request.context.html
#     except AttributeError:
#         html = ''
#     return {
#         'item_id': str(request.context._id),
#         'html': html
#     }
