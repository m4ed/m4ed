

def groupfinder(identification, request, debug=False):
    user = request.db.users.find_one(dict(username=identification))
    if user:
        groups = ['g:{}'.format(identification)]
        for g in user['groups']:
            groups.append('g:{}'.format(g))
        if debug:  # pragma: no cover
            print 'THESE ARE THE GROUPS GROUPFINDER FOUND'
            print groups
        return groups
