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
COLLECTION_NAME = config_tweet['MongoDB_Collection']

# Set up Mongo client
client = pymongo.MongoClient(URI)


def add_tweet(payload):
    tweet = json.loads(new_post(payload['username'], payload['content']))
    tweet_id = tweet['id']

    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]
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
    collection = db[COLLECTION_NAME]
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
    collection = db[COLLECTION_NAME]
    result = collection.delete_one(query)

    if(result.deleted_count == 1):
        return 400
    return 200


def search(payload):
    timestamp = math.floor(time.time())
    limit = SEARCH_LIMIT_DEFAULT
    if 'timestamp' in payload:
        timestamp = int(payload['timestamp'])
    if 'limit' in payload:
        limit = int(payload['limit']) if int(payload['limit']) < SEARCH_LIMIT_MAX else SEARCH_LIMIT_MAX
    
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]
    
    cursor = collection.find({'timestamp': {"$lte": timestamp}}).sort('timestamp', pymongo.DESCENDING).limit(limit)
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