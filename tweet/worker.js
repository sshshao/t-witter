const mongodb = require('mongodb').MongoClient;
const utils = require('./protocols/utils');

const MONGO_URI = require('./config').tweet.MongoDB_Uri;
const DB_NAME = require('./config').tweet.MongoDB_Name;
const TWEET_COLLECTION = require('./config').tweet.MongoDB_Tweet_Collection;
const PROFILE_COLLECTION = require('./config').tweet.MongoDB_Profile_Collection;
const ERROR_GET_TWEET = require('./protocols/messages').ERROR_GET_TWEET;
const ERROR_POST_TWEET = require('./protocols/messages').ERROR_POST_TWEET;
const ERROR_DELETE_TWEET = require('./protocols/messages').ERROR_DELETE_TWEET;

const STATUS_OK = 'OK';
const STATUS_ERROR = 'error';

// Initialize mongo connection
var db = null;
mongodb.connect(MONGO_URI, function(err, client) {
    if(err) throw err;
    db = client.db(DB_NAME);
});


exports.addTweet = function(payload) {
    return new Promise(function(resolve, reject) {
        var tweet = utils.tweetInsert(payload.username, payload.content, 
            payload.childType, payload.parent, payload.media);
        
        const collection = db.collection(TWEET_COLLECTION);
        collection.createIndex({ 'id': 1, 'username': 1 }, function(err, indexResult) {
            if(err) {
                console.error(err.message);
                return;
            }

            collection.insertOne(tweet, function(err, result) {
                if(err) {
                    console.error(err.message);
                    return;
                }
            });
        });
    });
    var response = {
        'status': STATUS_OK,
        'id': tweet.id,
        'item': tweet
    };
    resolve(response);
}

exports.getTweet = function(payload) {
    return new Promise(function(resolve, reject) {
        var query = utils.tweetQuery(payload.id);
        
        db.collection(TWEET_COLLECTION).findOne(query, function(err, result) {
            if(err) {
                resolve(utils.generateMessage(STATUS_ERROR, err.message));
                return;
            }

            if(result != null) {
                delete result._id;
                var response = {
                    'status': STATUS_OK,
                    'item': result
                };
                resolve(response);
            }
            else {
                resolve(utils.generateMessage(STATUS_ERROR, ERROR_GET_TWEET));
            }
        });            
    });
}

exports.deleteTweet = function(payload) {
    return new Promise(function(resolve, reject) {
        var query = utils.tweetQueryWithUsername(payload.id, payload.username);
       
        db.collection(TWEET_COLLECTION).findOneAndDelete(query, function(err, result) {
            if(err) {
                resolve(utils.generateMessage(STATUS_ERROR, err.message));
                return;
            }

            if(result.ok == 1) {
                var response = {
                    'status': STATUS_OK,
                    'media': result.value.media
                };
                resolve(response);
            }
            else {
                resolve(utils.generateMessage(STATUS_ERROR, ERROR_DELETE_TWEET));
            }
        });            
    });
}

exports.likeTweet = function(payload) {
    return new Promise(function(resolve, reject) {
        var query = utils.tweetQuery(payload.id);

        db.collection(TWEET_COLLECTION).findOne(query, function(err, result) {
            if(err) {
                resolve(utils.generateMessage(STATUS_ERROR, err.message));
                return;
            }

            if(result != null) {
                var user = payload.username;
                var likedBy = result.property.liked_by;
                var update = null;

                if(payload.like && !likedBy.includes(user)) {
                    update = utils.likeTweetUpdate(user);
                }
                else if(!payload.like && likedBy.includes(user)) {
                    update = utils.unlikeTweetUpdate(user);
                }

                if(update != null) {
                    db.collection(TWEET_COLLECTION).updateOne(query, update, function(err, result) {
                        if(err) {
                            resolve(utils.generateMessage(STATUS_ERROR, err.message));
                            return;
                        }
                    });
                }
                resolve(utils.generateMessage(STATUS_OK, ''));
            }
            else {
                resolve(utils.generateMessage(STATUS_ERROR, ERROR_GET_TWEET));
            }
        });            
    });
}

exports.searchTweet = function(payload) {
    return new Promise(function(resolve, reject) {
        db.collection(PROFILE_COLLECTION).findOne({'username': payload.username}, function(err, result) {
            if(err) {
                resolve(utils.generateMessage(STATUS_ERROR, err.message));
                return;
            }

            // Resolve list of following users if is logged in
            if(result != null && payload.following) {
                payload.targets = result.following;
            }
            else if(result == null && payload.following) {
                payload.targets = [];
            }

            var query = utils.searchQuery(payload.timestamp, payload.q, payload.target, 
                payload.targets, payload.parent, payload.replies, payload.hasMedia);
            var option = utils.searchOption(payload.rank, payload.limit);

            db.collection(TWEET_COLLECTION).find(query, option).toArray(function(err, results) {
                if(err) {
                    resolve(utils.generateMessage(STATUS_ERROR, err.message));
                    return;
                }

                var response = {
                    'status': STATUS_OK,
                };
                var items = [];
                // Remove BSON _ids
                for(var i = 0; i < results.length; i++) {
                    delete results[i]._id;
                    items.push(results[i]);
                }
                response.items = items;
                resolve(response);
            });                
        });            
    });
}