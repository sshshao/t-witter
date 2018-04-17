import json
from enum import Enum

STATUS_OK = "OK"
STATUS_ERROR = "error"


class REQ_ACTION(Enum):
    ADD_TWEET = 1,
    GET_TWEET = 2,
    DELETE_TWEET = 3,
    LIKE_TWEET = 4,
    SEARCH = 5,


def generate_message(status, msg):
    if status == STATUS_OK:
        return json.dumps({
            'status': STATUS_OK,
            'message': msg,
        })
    else:
        return json.dumps({
            'status': status,
            'error': msg,
        })


def generate_payload(status, msg, payload):
    if status == STATUS_OK:
        return json.dumps({
            'status': STATUS_OK,
            'message': msg,
            'payload': payload
        })
    else:
        return json.dumps({
            'status': status,
            'error': msg,
            'payload': payload
        })


def decode_json(json_payload):
    return json.loads(json_payload)