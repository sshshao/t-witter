const mongodb = require('mongodb').MongoClient;
const utils = require('./protocols/utils');
const mongoose = require('mongoose');
const mexp = require('mongoose-elasticsearch-xp');

const MONGO_URI = require('./config').tweet.MongoDB_Uri;
const DB_NAME = require('./config').tweet.MongoDB_Name;
//const TWEET_COLLECTION = require('./config').tweet.MongoDB_Tweet_Collection;
const PROFILE_COLLECTION = require('./config').tweet.MongoDB_Profile_Collection;
const ES_HOST = require('./config').tweet.ES_HOST;
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

// Initialize mongoose connection
mongoose.connect(MONGO_URI, {
    dbName: DB_NAME,
    autoIndex: false,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 500,
    bufferMaxEntries: 0
});

var tweetSchema = utils.getTweetSchema();
tweetSchema.plugin(mexp, {hosts: [ES_HOST]});
if (!tweetSchema.options.toObject) tweetSchema.options.toObject = {};
tweetSchema.options.toObject.transform = function (doc, ret, options) {
    // remove the auto generated value of every document before returning the result
    delete ret._id;
    delete ret.__v;
    return ret;
}

var Tweet = mongoose.model('tweet', tweetSchema);


exports.addTweet = function(payload) {
    return new Promise(function(resolve, reject) {
        var tweet = new Tweet(utils.tweetInsert(payload.id, payload.username, payload.content,  
            payload.childType, payload.parent, payload.media));
        tweet.save(function (err) {
            if(err) {
                console.error(err.message);
                return;
            }

            var response = {
                'status': STATUS_OK,
                'id': payload.id,
                'item': tweet.toObject()
            };
            resolve(response);
        });
    });
}

exports.getTweet = function(payload) {
    return new Promise(function(resolve, reject) {
        var query = utils.tweetQuery(payload.id);
        
        Tweet.findOne(query).lean().exec(function(err, result) {
            if(err) {
                resolve(utils.generateMessage(STATUS_ERROR, err.message));
                return;
            }

            if(result != null) {
                delete result._id;
                delete result.__v;

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

        Tweet.findOneAndRemove(query, function(err, result) {
            if(err) {
                resolve(utils.generateMessage(STATUS_ERROR, err.message));
                return;
            }

            if(result != null) {
                var response = {
                    'status': STATUS_OK,
                    'media': result.toObject().media
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

        Tweet.findOne(query).lean().exec(function(err, result) {
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
                    Tweet.findOneAndUpdate(query, update, function(err, result) {
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

            var query = utils.searchQuery(payload.limit, parseInt(payload.timestamp), payload.q, payload.target, 
                payload.targets, payload.parent, payload.replies, payload.hasMedia, payload.rank);

            Tweet.esSearch(query).then(function(results) {
                var response = {
                    'status': STATUS_OK,
                    'items': []
                };
                console.log("result: " + results);

                if(results != null) {
                    for(var i = 0; i < results.length; i++) {
                        delete results[i]._id;
                        response.items.push(results[i]);
                    }
                }
                resolve(response);
            });      
        });            
    });
}