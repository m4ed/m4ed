
import valideer
from valideer import Validator
from valideer import AdaptTo
from valideer.base import ValidationError

from bson import ObjectId
from pymongo.errors import InvalidId

from m4ed.util.filters import force_utf8


class UTF8(valideer.String):

    name = 'utf8'

    def __init__(self, min_length=3, max_length=1024, must_contain=[], nullable=True):
        super(UTF8, self).__init__(
            min_length=min_length,
            max_length=max_length
            )
        self.must_contain = must_contain
        self.nullable = nullable

    def validate(self, value, adapt=True):
        if value in ['', None] and self.nullable:
            return ''
        super(UTF8, self).validate(value)

        for c in self.must_contain:
            if c not in value:
                raise ValidationError(
                    ('Invalid email address {}. '
                    'A valid email address must contain at least '
                    'one @ characters'.format(value))
                    )

        return force_utf8(value)


class BsonObjectIdValidator(valideer.String):

    name = 'objectid'

    def __init__(self, length=24):
        super(BsonObjectIdValidator, self).__init__(
            min_length=length,
            max_length=length
            )

    def validate(self, value, adapt=True):
        super(BsonObjectIdValidator, self).validate(value)

        try:
            ObjectId(value)
        except InvalidId:
            raise ValidationError

    def is_valid(self, value):
        try:
            self.validate(value)
        except ValidationError:
            return False
        return True

Validator.register('username', UTF8(min_length=3))
Validator.register('password', UTF8(min_length=5))
Validator.register('email', UTF8(min_length=3, must_contain=[u'@'], nullable=True))
#Validator.register('objectid', BsonObjectIdValidator())

_VALIDATORS = dict(
    space=Validator.parse({
        '+title': valideer.String(min_length=1),
        '+desc': valideer.String(min_length=1)
    }),
    cluster=Validator.parse({
        '+title': valideer.String(min_length=1),
        '+desc': valideer.String(min_length=1),
        '+space_id': AdaptTo(ObjectId)
    }),
    item=Validator.parse({
        '?_id': AdaptTo(ObjectId),  # Every item has this except newly created ones
        '+cluster_id': AdaptTo(ObjectId),  # The cluster this item belongs to
        '+answers': {
            'string': [
                'string'
            ]
        },
        '+desc': valideer.String(min_length=1),
        '+html': 'string',
        '+listIndex': AdaptTo(int),
        '+tags': ['string'],
        '+text': 'string',
        '+title': valideer.String(min_length=1)
    }),
    user_registration_form=Validator.parse({
        '+username': 'username',
        '+pw1': 'password',
        '+pw2': 'password',
        '?email': 'email'
    })
)


def get_validator(name):
    return _VALIDATORS[name]


def get_space_validator():
    return get_validator('space')


def get_cluster_validator():
    return get_validator('cluster')


def get_item_validator():
    return get_validator('item')


def get_user_registration_form_validator():
    return get_validator('user_registration_form')
