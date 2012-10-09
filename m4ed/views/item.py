
from pyramid.view import view_config

from m4ed.resources import student_less


@view_config(route_name='item', renderer='student/item.mako', permission='read')
def get_item(request):
    student_less.need()

    item = request.context.stripped

    if not item.html:
        item.html = ''
    return {
        'item': item,
        'cluster_title': request.context.get_cluster_title()
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
