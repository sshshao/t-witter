import json
from enum import Enum

STATUS_OK = "OK"
STATUS_ERROR = "error"


class REQ_ACTION(Enum):
    ADD_PROFILE = 1
    GET_PROFILE = 2,
    GET_FOLLOWER = 3,
    GET_FOLLOWING = 4
    FOLLOW = 5,


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