

def groupfinder(identification, request):
    user = request.db.users.find_one(dict(username=identification))
    if user:
        groups = ['g:{}'.format(identification)]
        for g in user['groups']:
            groups.append('g:{}'.format(g))
        print 'THESE ARE THE GROUPS GROUPFINDER FOUND'
        print groups
        return groups
