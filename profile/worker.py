import configparser
import pymongo
import sys, os
import math, time
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from protocols.messages import *
from protocols.rpc_protocols import *

# Get consts from config file
RES_SUCCESS = STATUS_OK
RES_FAILURE = STATUS_ERROR

config = configparser.ConfigParser()
config.read('./config.ini')

config_profile = config['PROFILE']
QUERY_LIMIT_DEFAULT = int(config_profile['Query_Limit_Default'])
QUERY_LIMIT_MAX = int(config_profile['Query_Limit_Max'])
URI = config_profile['MongoDB_Uri']
DB_NAME = config_profile['MongoDB_Name']
COLLECTION_NAME = config_profile['MongoDB_Collection']

# Set up Mongo client
client = pymongo.MongoClient(URI)


def add_profile(payload):
    profile = json.load(new_profile(payload['id'], payload['username'], payload['email']))

    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]
    result = collection.insert_one(profile)

    if(result.inserted_id == None):
        return generate_message(RES_FAILURE, ERROR_ADD_PROFILE)

    return generate_message(RES_SUCCESS, SUCCESS_ADD_PROFILE)


def get_profile(payload):
    query = json.load(query_profile(payload['username']))

    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]
    result = collection.find_one(query)

    if(result == None):
        return generate_message(RES_FAILURE, ERROR_GET_TWEET)
    
    res = json.dumps({
        'status': RES_SUCCESS,
        'user': {
            'email': result['email'],
            'followers': len(result['follower']),
            'following': len(result['following'])
        }
    })
    return res


def get_follower(payload):
    limit = QUERY_LIMIT_DEFAULT
    if 'limit' in payload:
        limit = int(payload['limit']) if int(payload['limit']) < QUERY_LIMIT_MAX else QUERY_LIMIT_MAX

    query = json.load(query_profile(payload['username']))

    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]
    result = collection.find_one(query)

    if(result == None):
        return generate_message(RES_FAILURE, ERROR_GET_TWEET)

    follower = result['follower'][:limit]
    res = json.dumps({
        'status': RES_SUCCESS,
        'users': follower
    })
    return res


def get_following(payload):
    limit = QUERY_LIMIT_DEFAULT
    if 'limit' in payload:
        limit = int(payload['limit']) if int(payload['limit']) < QUERY_LIMIT_MAX else QUERY_LIMIT_MAX

    query = json.load(query_profile(payload['username']))

    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]
    result = collection.find_one(query)

    if(result == None):
        return generate_message(RES_FAILURE, ERROR_GET_TWEET)

    following = result['following'][:limit]
    res = json.dumps({
        'status': RES_SUCCESS,
        'users': following
    })
    return res


def follow(payload):
    return payload