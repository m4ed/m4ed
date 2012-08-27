from random import randint
import pymongo
from m4ed.util.base62 import Base62

# Insert some dummy data

db_name = 'm4ed'
db_conn = pymongo.Connection()
db = db_conn['m4ed']

items = []
child_items = []

# Insert some lessons
r = randint(2, 5)
for i in range(0, r):
    items.append({
        'title': 'Lesson {}'.format(i + 1),
        'desc': 'Description for lesson {}'.format(i + 1),
        'text': '## Content for lesson {}'.format(i + 1),
    })
# Clear the collection
db.items.drop()
print "Items dropped."

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
            'text': '## Content for exercise {}.{}'.format(i, j),
            'listIndex': listIndex
        })
        listIndex += 1

    print "Added Lesson {} with {} exercises.".format(i, r)


# Clear the collection
db.assets.drop()
print "Assets dropped."

r = randint(20, 50)

base62_id = Base62(0)

for i in range(1, r):
    base62_id += 1
    db.assets.insert({
        'title': 'Asset #{}'.format(base62_id),
        'desc': 'Description of asset #{}'.format(base62_id),
        'name': 'Placeholder thumbnail #{}'.format(base62_id),
        'url': 'http://placehold.it/320x240',
        'thumbnail_url': '/fanstatic/m4ed/img/90x90.gif',
        'delete_url': '',
        'delete_type': 'DELETE',
        'id': str(base62_id),
        'type': 'image',
        'tags': [],
        'size': 150
    })
print "Added {} images.".format(r)
