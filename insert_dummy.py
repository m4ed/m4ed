from random import randint
import pymongo
from livemockup.util import Base62

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
    for j in range(r):
        db.items.insert({
            'type': 'exercise',
            'title': 'Exercise {}.{}'.format(i + 1, j + 1),
            'desc': 'Description for exercise {}.{}'.format(i + 1, j + 1),
            'text': '## Content for exercise {}.{}'.format(i + 1, j + 1),
            'listIndex': listIndex
        })
        listIndex += 1

    print "Added Lesson {} with {} exercises.".format(i + 1, r)


# Clear the collection
db.assets.drop()
print "Assets dropped."

r = randint(10, 30)
listIndex += 1

base62_id = Base62(0)

for i in range(r):
    db.assets.insert({
        'desc': 'Description of asset {}'.format(i + 1),
        'src': 'http://placehold.it/150x100',
        'id': base62_id.increment(),
        'title': 'Placeholder image {}'.format(i + 1),
        'type': 'image'
    })
    listIndex += 1
print "Added {} images.".format(r)
