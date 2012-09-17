from m4ed.models import User


def groupfinder(identification, request, debug=False):
    user = User(request.db.users.find_one(dict(name=identification)))
    if user:
        # Every user belongs to group which is their user name
        # prefixed with g:
        groups = ['g:' + identification]
        for g in user.groups:
            groups.append('g:{}'.format(g))
        if debug:  # pragma: no cover
            print 'THESE ARE THE GROUPS GROUPFINDER FOUND'
            print groups
        return groups
