import configparser
import pymongo
import sys, os
import math, time
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from protocols.messages import *
from protocols.schema import *
from protocols.rpc_protocols import *

# Get consts from config file
RES_SUCCESS = STATUS_OK
RES_FAILURE = STATUS_ERROR

config = configparser.ConfigParser()
config.read('./config.ini')

config_profile = config['PROFILE']
QUERY_LIMIT_DEFAULT = int(config_profile['Query_Limit_Default'])
QUERY_LIMIT_MAX = int(config_profile['Query_Limit_Max'])
DB_NAME = config_profile['MongoDB_Name']
NODE_NAME = config_profile['MongoDB_Node']
PORT_NUM = int(config_profile['MongoDB_Mgs_Port'])
COLLECTION_NAME = config_profile['MongoDB_Collection']

# Set up Mongo client
client = pymongo.MongoClient('mongodb://%s' % NODE_NAME, PORT_NUM, maxPoolSize=100, waitQueueMultiple=10)


def add_profile(payload):
    profile = json.loads(new_profile(payload['id'], payload['username'], payload['email']))

    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]
    collection.create_index([('username', pymongo.ASCENDING)],background=True)
    result = collection.insert_one(profile)

    if(result.inserted_id == None):
        return generate_message(RES_FAILURE, ERROR_ADD_PROFILE)

    return generate_message(RES_SUCCESS, SUCCESS_ADD_PROFILE)


def get_profile(payload):
    query = json.loads(query_profile(payload['username']))

    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]
    result = collection.find_one(query)

    if(result == None):
        return generate_message(RES_FAILURE, ERROR_FOLLOWING)
    
    res = json.dumps({
        'status': RES_SUCCESS,
        'user': {
            'username': result['username'],
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

    query = json.loads(query_profile(payload['username']))

    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]
    result = collection.find_one(query)

    if(result == None):
        return generate_message(RES_FAILURE, ERROR_FOLLOWING)

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

    query = json.loads(query_profile(payload['username']))

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
    do_follow = True if 'follow' not in payload else payload['follow']
    
    query_user = json.loads(query_profile(payload['user']))
    query_target  = json.loads(query_profile(payload['target']))

    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]
    user = collection.find_one(query_user)
    target = collection.find_one(query_target)

    if (user == None) or (target == None):
        return generate_message(RES_FAILURE, ERROR_NO_USER)

    if do_follow:
        if user['username'] in target['follower']:
            return generate_message(RES_SUCCESS, '')
        else:
            result_user = collection.update_one(query_user, {'$push': {'following': target['username']}}, upsert=False)
            result_target = collection.update_one(query_target, {'$push': {'follower': user['username']}}, upsert=False)
            if (result_user.modified_count != 1) or (result_target.modified_count != 1):
                return generate_message(RES_FAILURE, ERROR_FOLLOWING)
            
            return generate_message(RES_SUCCESS, '')
    else:
        if user['username'] in target['follower']:
            result_user = collection.update_one(query_user, {'$pull': {'following': target['username']}}, upsert=False)
            result_target = collection.update_one(query_target, {'$pull': {'follower': user['username']}}, upsert=False)

            if (result_user.modified_count != 1) or (result_target.modified_count != 1):
                return generate_message(RES_FAILURE, ERROR_FOLLOWING)
            
            return generate_message(RES_SUCCESS, '')
        else:
            return generate_message(RES_SUCCESS, '')