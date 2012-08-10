from random import randint
import pymongo
from m4ed.util import Base62

# Insert some dummy data

db_name = 'm4ed'
db_conn = pymongo.Connection()
db = db_conn['m4ed']

items = []
child_items = []

# Insert some lessons
for i in range(5):
    items.append({
        'type': 'lesson',
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
    r = randint(0, 5)
    item = db.items.find_and_modify(query={'_id': item_id}, update={'$set': {'listIndex': listIndex}})
    listIndex += 1
    i += 1
    for j in range(1, r):
        db.items.insert({
            'type': 'exercise',
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

r = randint(3, 20)

base62_id = Base62(0)

for i in range(1, r):
    base62_id += 1
    db.assets.insert({
        'desc': 'Description of asset {}'.format(i),
        'name': 'Placeholder thumbnail {}'.format(i),
        'url': 'http://placehold.it/150x100',
        'thumbnail_url': 'http://placehold.it/150x100',
        'delete_url': '',
        'delete_type': 'DELETE',
        'id': str(base62_id),
        'type': 'image',
        'size': 150
    })
print "Added {} images.".format(r)
