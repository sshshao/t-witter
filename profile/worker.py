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
URI = config_profile['MongoDB_Uri']
DB_NAME = config_profile['MongoDB_Name']
COLLECTION_NAME = config_profile['MongoDB_Collection']

# Set up Mongo client
client = pymongo.MongoClient(URI)


def get_profile(payload):
    return payload


def get_follower(payload):
    return payload


def get_following(payload):
    return payload


def follow(payload):
    return payload