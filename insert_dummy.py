from random import randint
import pymongo
from m4ed.util.base62 import Base62

# Insert some dummy data

db_name = 'm4ed'
db_conn = pymongo.Connection()
db = db_conn['m4ed']

items = []
child_items = []

db.spaces.drop()
print "- Spaces dropped."
db.clusters.drop()
print "- Clusters dropped."
db.users.remove({"username": "m4ed"})
print '- Removed user "m4ed"'

db.users.insert({
    "password": "$2a$12$Suow7A.rkHgi4gWqhuGmLeHLsFZ1bry5hXY9j0KzK4VHoFiFOoOq6",
    "username": "m4ed",
    "groups": [],
    "email": "m4ed@m4ed.com"
})
print '+ Added user "m4ed" with password "12345".'

space_id = db.spaces.insert({
    "listIndex": 0,
    "title": "Space 1",
    "desc": "Space description",
    "tags": [],
    "groups_read": ["m4ed"],
    "groups_write": ["m4ed"]
    })
print '+ Added Space 1.'

cluster_id = db.clusters.insert({
    "listIndex": 0,
    "title": "Cluster 1",
    "space_id": space_id,
    "groups_read": ["m4ed"],
    "groups_write": ["m4ed"],
    "desc": "Cluster description",
    "tags": []
    })
print '+ Added Cluster 1.'

# Insert some lessons
r = randint(2, 5)
for i in range(0, r):
    items.append({
        'title': 'Lesson {}'.format(i + 1),
        'desc': 'Description for lesson {}'.format(i + 1),
        'cluster_id': cluster_id,
        'tags': ['tag1', 'tag2', 'tag3'],
        'text': '## Content for lesson {}'.format(i + 1),
        'html': ''
    })
# Clear the collection
db.items.drop()
print "- Items dropped."

item_ids = db.items.insert(items)

listIndex = 0

# Insert some exercises
for i, item_id in enumerate(item_ids):
    r = randint(0, 3)
    item = db.items.find_and_modify(query={'_id': item_id}, update={'$set': {'listIndex': listIndex}})
    listIndex += 1
    i += 1
    for j in range(1, r):
        db.items.insert({
            'title': 'Exercise {}.{}'.format(i, j),
            'desc': 'Description for exercise {}.{}'.format(i, j),
            'cluster_id': cluster_id,
            'tags': [],
            'text': '## Content for exercise {}.{}'.format(i, j),
            'listIndex': listIndex
        })
        listIndex += 1

    print "+ Added Lesson {} with {} exercises.".format(i, r)


# Clear the collection
db.assets.drop()
print "- Assets dropped."

r = randint(20, 50)

base62_id = Base62(0)

for i in range(1, r):
    base62_id += 1
    db.assets.insert({
        'title': 'Asset #{}'.format(base62_id),
        'desc': 'Description of asset #{}'.format(base62_id),
        'name': 'Placeholder thumbnail #{}'.format(base62_id),
        'url': '/fanstatic/m4ed/img/90x90.gif',
        'thumbnail_url': '/fanstatic/m4ed/img/90x90.gif',
        'delete_url': '',
        'delete_type': 'DELETE',
        'id': str(base62_id),
        'type': 'image',
        'tags': [],
        'size': 150
    })
print "+ Added {} images.".format(r)
