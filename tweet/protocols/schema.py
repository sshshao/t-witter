import json
import math
import time
import uuid

db_model = json.dumps({
    'id': 'ixo134j03k4l3',
    'username': 'mazafaka',
    'property': {
        'likes': 0
    },
    'retweeted': 0,
    'content': '9C9EF148 :参戦ID 参加者募集！Lv100 ゼノ・コロゥ',
    'timestamp': 1521959941
})

amqp = json.dumps({
    'action': '/additem',
    'payload': {
        'content': '9C9EF148 :参戦ID 参加者募集！Lv100 ゼノ・コロゥ',
        'childType': None,
        'parent': '0xo184e',
        'media': []
    }
})

def new_post(username, content):
    return json.dumps({
        'id': generate_tweet_id(),
        'username': username,
        'property': {
            'likes': 0
        },
        'retweeted': 0,
        'content': content,
        'timestamp': math.floor(time.time())
    })


def tweet_query(id):
    return json.dumps({
        'id': id
    })


def generate_tweet_id():
    return uuid.uuid4().hex[:16]