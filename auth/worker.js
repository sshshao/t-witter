const { Pool, Client } = require('pg');
const utils = require('./protocols/utils');

const PG_HOST = require('./config').auth.PostgreSQL_Host;
const PG_USER = require('./config').auth.PostgreSQL_User;
const PG_USER_PW = require('./config').auth.PostgreSQL_Password;
const PG_DB_NAME = require('./config').auth.PostgreSQL_DBName;

const STATUS_OK = 'OK';
const STATUS_ERROR = 'error';

// Initialize postgre connection
const pgPool = new Pool({
    user: PG_USER,
    host: PG_HOST,
    database: PG_DB_NAME,
    password: PG_USER_PW,
    port: 3211
});

pgPool.on('error', (err, client) => {
    console.error('[DB] Postgre Error: ', err);
    process.exit(-1);
});

exports.login = function(payload) {
    return new Promise(function(resolve, reject) {
        var tweet = utils.tweetInsert(payload.id, payload.username, payload.content, 
            payload.childType, payload.parent, payload.media);
        
        const collection = db.collection(TWEET_COLLECTION);
        collection.createIndexes(utils.searchIndex, function(err, indexResult) {
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

        var response = {
            'status': STATUS_OK,
            'id': tweet.id,
            'item': tweet
        };
        resolve(response);
    });
}

exports.register = function(payload) {
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

exports.validate = function(payload) {
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