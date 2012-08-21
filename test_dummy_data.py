
from random import randint
import pymongo
from m4ed.util import Base62

db_name = 'm4ed_test'
db_conn = pymongo.Connection()
db = db_conn[db_name]

items = []
child_items = []

# Insert users
users = [
    {"groups": ["superuser"],
    "password": "1234",
    "username": "superuser"},
    {"groups": [],
    "password": "1234",
    "username": "user"}
]

db.users.drop()
db.users.insert(users)

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

base62_id = Base62(1)

db.assets.insert({
    'desc': 'Description of asset {}'.format(i),
    'name': 'Placeholder thumbnail {}'.format(i),
    'url': 'http://aa0566690bf19e5cedc6-7b0b9df36b1d82e33166b0384c6dfca8.r20.cf1.rackcdn.com/1.jpg',
    'thumbnail_url': 'http://aa0566690bf19e5cedc6-7b0b9df36b1d82e33166b0384c6dfca8.r20.cf1.rackcdn.com/1_s.jpg',
    'delete_url': '/api/assets/{}'.format(str(base62_id)),
    'delete_type': 'DELETE',
    'id': str(base62_id),
    'type': 'image',
    'tags': []
})
print "Added test image."
