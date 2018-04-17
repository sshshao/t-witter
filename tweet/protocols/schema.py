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

def new_post(username, content, childType, parent, media):
    return json.dumps({
        'id': generate_tweet_id(),
        'username': username,
        'property': {
            'likes': 0,
            'liked_by': []
        },
        'retweeted': 0,
        'content': content,
        'timestamp': math.floor(time.time()),
        'childType': childType,
        'parent': parent,
        'media': media
    })


def tweet_query(id):
    return json.dumps({
        'id': id
    })


def user_tweet_query(id, username):
    return json.dumps({
        'id': id,
        'username': username
    })


def like_tweet_update(user):
    return json.dumps({
        '$inc': { 
            'property.likes': 1
        }, 
        '$push': {
            'property.liked_by': user
        }
    })


def unlike_tweet_update(user):
    return json.dumps({
        '$inc': { 
            'property.likes': -1
        }, 
        '$pull': {
            'property.liked_by': user
        }
    })


def query_search(timestamp, q, username, targets):
    '''
    query = { '$and': [
        { 'timestamp': {'$lte': timestamp} },
        { 'content': {'$regex' : '.*'+q+'.*'} }
        { 'username': username }, 
        { 'username': {'$in': targets} }
    ]}
    '''
    query = { '$and': [
        { 'timestamp': {'$lte': timestamp} }
    ]}

    if q != None:
        query['$and'].append({'content': {'$regex': '.*'+q+'.*'}})
    if username != None:
        query['$and'].append({'username': username})
    if targets != None:
        query['$and'].append({'username': {'$in': targets}})
    
    return json.dumps(query)


def generate_tweet_id():
    return uuid.uuid4().hex[:16]