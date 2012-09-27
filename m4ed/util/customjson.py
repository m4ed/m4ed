import json
from bson import ObjectId


class customJSONEncoder(json.encoder.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        return json.encoder.JSONEncoder.default(self, obj)


def dumps(obj):
    return json.dumps(obj, cls=customJSONEncoder)
