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
URI = config_tweet['MongoDB_Uri']
DB_NAME = config_tweet['MongoDB_Name']
TWEET_COLLECTION_NAME = config_tweet['MongoDB_Tweet_Collection']
PROFILE_COLLECTION_NAME = config_tweet['MongoDB_Profile_Collection']

# Set up Mongo client
client = pymongo.MongoClient(URI)


def add_tweet(payload):
    tweet = json.loads(new_post(payload['username'], payload['content']))
    tweet_id = tweet['id']

    db = client[DB_NAME]
    collection = db[TWEET_COLLECTION_NAME]
    result = collection.insert_one(tweet)

    if(result.inserted_id == None):
        return generate_message(RES_FAILURE, ERROR_POST_TWEET)

    res = json.dumps({
        'status': RES_SUCCESS,
        'id': tweet_id
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
    query = json.loads(tweet_query(payload['id']))

    db = client[DB_NAME]
    collection = db[TWEET_COLLECTION_NAME]
    result = collection.delete_one(query)

    if(result.deleted_count == 1):
        return generate_message(RES_FAILURE, ERROR_GET_TWEET)
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
    following = payload['following']
    targets = None
    if following:
        result = profile_collection.find_one({'username': user})
        targets = result['following']
    limit = SEARCH_LIMIT_DEFAULT
    if 'limit' in payload:
        limit = int(payload['limit']) if int(payload['limit']) < SEARCH_LIMIT_MAX else SEARCH_LIMIT_MAX

    # Start Query
    query = json.loads(query_search(timestamp, q, username, targets))
    cursor = tweet_collection.find(query).sort('timestamp', pymongo.DESCENDING).limit(limit)
    if(cursor == None):
        return generate_message(RES_SUCCESS, SEARCH_NO_RESULT)

    result = []
    for doc in cursor:
        del doc['_id']
        result.append({'item': doc})
    
    res = json.dumps({
        'status': RES_SUCCESS,
        'items': result
    })
    return res