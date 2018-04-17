import json
import math
import time
import uuid
import pymongo


def new_post(username, content, childType, parent, media):
    return json.dumps({
        'id': generate_tweet_id(),
        'username': username,
        'timestamp': math.floor(time.time()),
        'content': content,
        'retweeted': 0,
        'property': {
            'likes': 0,
            'liked_by': []
        },
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


def search_query(timestamp, q, username, targets, parent):
    '''
    query = { '$and': [
        { 'timestamp': {'$lte': timestamp} },
        { 'content': {'$regex' : '.*'+q+'.*'} },
        { 'username': username },
        { 'username': {'$in': targets} },
        { 'parent': parent },
        { 'childType': {'$not': 'reply'} },
        { 'media': { '$size': { 'gt': 0 } } }
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
    if parent != None:
        query['$and'].append({'parent': parent})
    if replies != None:
        query['$and'].append({'childType': {'$not': 'reply'}})
    if hasMedia:
        query['$and'].append({'media': {'$size': {'$gt': 1}}})

    return json.dumps(query)


def search_sort(rank):
    if rank == 'interest':
        return [
            ('timestamp', pymongo.DESCENDING), 
            ('retweeted', pymongo.DESCENDING),
            ('property.likes', pymongo.DESCENDING)
        ]
    else:
        return [('timestamp', pymongo.DESCENDING)]


def generate_tweet_id():
    return uuid.uuid4().hex[:16]