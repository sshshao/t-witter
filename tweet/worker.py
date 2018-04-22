import configparser
import pymongo
import sys, os
import math, time
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from protocols.schema import *
from protocols.messages import *
from protocols.rpc_protocols import *

# Get consts from config file
RES_SUCCESS = STATUS_OK
RES_FAILURE = STATUS_ERROR

config = configparser.ConfigParser()
config.read('./config.ini')

config_tweet = config['TWEET']
SEARCH_LIMIT_DEFAULT = int(config_tweet['Search_Limit_Default'])
SEARCH_LIMIT_MAX = int(config_tweet['Search_Limit_Max'])
DB_NAME = config_tweet['MongoDB_Name']
NODE_NAME = config_tweet['MongoDB_Node']
PORT_NUM = int(config_tweet['MongoDB_Mgs_Port'])
TWEET_COLLECTION_NAME = config_tweet['MongoDB_Tweet_Collection']
PROFILE_COLLECTION_NAME = config_tweet['MongoDB_Profile_Collection']

# Set up Mongo client
client = pymongo.MongoClient('mongodb://%s' % NODE_NAME, PORT_NUM, maxPoolSize=100, waitQueueMultiple=10)


def add_tweet(payload):
    payload['childType'] = None if 'childType' not in payload else payload['childType']
    payload['parent'] = None if 'parent' not in payload else payload['parent']
    payload['media'] = [] if 'media' not in payload else payload['media']

    tweet = json.loads(new_post(payload['username'], payload['content'], 
        payload['childType'], payload['parent'], payload['media']))
    tweet_id = tweet['id']

    db = client[DB_NAME]
    collection = db[TWEET_COLLECTION_NAME]
    collection.create_index([('timestamp', pymongo.DESCENDING), 
        ('id', pymongo.ASCENDING),
        ('username', pymongo.ASCENDING)], 
        background=True)
    result = collection.insert_one(tweet)

    if(result.inserted_id == None):
        return generate_message(RES_FAILURE, ERROR_POST_TWEET)

    res = json.dumps({
        'status': RES_SUCCESS,
        'id': tweet_id,
        'item': tweet
    })
    return res


def get_tweet(payload):
    query = json.loads(tweet_query(payload['id']))

    db = client[DB_NAME]
    collection = db[TWEET_COLLECTION_NAME]
    result = collection.find_one(query)

    if(result == None):
        return generate_message(RES_FAILURE, ERROR_GET_TWEET)
    del result['_id']
    
    res = json.dumps({
        'status': RES_SUCCESS,
        'item': result
    })
    return res


def delete_tweet(payload):
    query = json.loads(user_tweet_query(payload['id'], payload['username']))

    db = client[DB_NAME]
    collection = db[TWEET_COLLECTION_NAME]
    tweet = collection.find_one(query)
    result = collection.delete_one(query)

    if(result.deleted_count != 1):
        return generate_message(RES_FAILURE, ERROR_GET_TWEET)
    return generate_del_msg(RES_SUCCESS, '', tweet['media'] if tweet != None else None)


def like_tweet(payload):
    like = True if 'like' not in payload else payload['like']
    
    query = json.loads(tweet_query(payload['id']))
    user = payload['username']

    db = client[DB_NAME]
    collection = db[TWEET_COLLECTION_NAME]
    result = collection.find_one(query)
    if result == None:
        return generate_message(RES_FAILURE, ERROR_GET_TWEET)
    liked_by = result['property']['liked_by']
    
    if like:
        if user in liked_by:
            return generate_message(RES_SUCCESS, '')
        else:
            update = json.loads(like_tweet_update(user))
            collection.update_one(query, update, upsert=False)
    else:
        if user in liked_by:
            update = json.loads(unlike_tweet_update(user))
            collection.update_one(query, update, upsert=False)
        else:
            return generate_message(RES_SUCCESS, '')


def search(payload):
    db = client[DB_NAME]
    tweet_collection = db[TWEET_COLLECTION_NAME]
    profile_collection = db[PROFILE_COLLECTION_NAME]

    # Process queries conditions
    timestamp = math.floor(time.time()) if 'timestamp' not in payload else int(payload['timestamp'])
    q = None if 'q' not in payload else payload['q']
    user = None if 'user' not in payload else payload['user']
    username = None if 'username' not in payload else payload['username']
    following = True if 'following' not in payload else payload['following']
    rank = 'interest' if 'rank' not in payload else payload['rank']
    parent = None if 'parent' not in payload else payload['parent']
    replies = True if 'replies' not in payload else payload['replies']
    hasMedia = False if 'hasMedia' not in payload else payload['hasMedia']
    targets = None
    if following:
        targets = []
        result = profile_collection.find_one({'username': user})
        if result != None:
            targets = result['following']
    limit = SEARCH_LIMIT_DEFAULT
    if 'limit' in payload:
        limit = int(payload['limit']) if int(payload['limit']) < SEARCH_LIMIT_MAX else SEARCH_LIMIT_MAX

    # Start Query
    query = json.loads(search_query(timestamp, q, username, targets, parent, replies, hasMedia))

    #sort by interest or time
    cursor = tweet_collection.find(query).sort(search_sort(rank)).limit(limit)
    if(cursor == None):
        res = json.dumps({
            'status': RES_SUCCESS,
            'items': []
        })
        return res

    result = []
    for doc in cursor:
        del doc['_id']
        result.append(doc)
    
    res = json.dumps({
        'status': RES_SUCCESS,
        'items': result
    })
    
    return res