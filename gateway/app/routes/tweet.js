var Memcached = require('memcached');
const utils = require('../protocols/utils');
const dispatcher = require('./dispatcher');
const auth = require('./auth');
const media = require('./media');

const AMQP_TWEET_QUEUE = require('../config').tweet.AMQP_Queue;
const RPC_TWEET_ACTION = require('../protocols/rpc_protocols').RPC_Tweet_Action;
const MCD_HOST = require('../config').memcached.Mcd_Host;
const ERROR_NOT_YET_LOGIN_MESSAGE = require('../protocols/messages').ERROR_NOT_YET_LOGIN_MESSAGE;

const STATUS_OK = 'OK';
const STATUS_ERROR = 'error';

var mcd_options = {retries: 10, retry: 10000, poolSize: 50};
var memcached = new Memcached(MCD_HOST, mcd_options);

exports.post = function(req, res) {
    var cookie = auth.checkLogin(req);
    if(cookie[0]) {
        var input_data = req.body;
        var msg = {
            'action': RPC_TWEET_ACTION.ADD_TWEET,
            'payload': {
                ...input_data,
                'username': cookie[1]
            }
        };
        dispatcher.dispatch(AMQP_TWEET_QUEUE, JSON.stringify(msg), (response) => {
            response = JSON.parse(response);
            memcached.add(utils.MCDtweetKey(response.item.id), response.item, 3600, function(err) {
                if(err) {
                    console.error('[Cache] Cache error:', err.message);
                }
            });
            res.json(response);
        });
    }
    else {
        var response = utils.generateMessage(STATUS_ERROR, ERROR_NOT_YET_LOGIN_MESSAGE);
        res.json(response);
    }
}

exports.get = function(req, res) {
    var tweetId = req.params.id;
    memcached.get(utils.MCDtweetKey(tweetId), function(err, tweet) {
        if(err) {
            console.error('[Cache] Cache error:', err.message);
        }

        if(tweet != null) {
            res.json(tweet);
        }
        else {
            var msg = {
                'action': RPC_TWEET_ACTION.GET_TWEET,
                'payload': {
                    'id': tweetId
                }
            }
            dispatcher.dispatch(AMQP_TWEET_QUEUE, JSON.stringify(msg), (response) => {
                response = JSON.parse(response);
                if(response.status == STATUS_ERROR){
                    res.json(response);
                }
                else{
                    memcached.add(utils.MCDtweetKey(response.item.id), response.item, 3600, function(err) {
                        if(err) {
                            console.error('[Cache] Cache error:', err.message);
                        }
                    });
                    res.json(response);
                }
            });
        }
    });
}

exports.remove = function(req, res) {
    var cookie = auth.checkLogin(req);
    if(cookie[0]) {
        var tweetId = req.params.id;
        memcached.del(utils.MCDtweetKey(tweetId), function(err) {
            if(err) {
                console.error('[Cache] Cache error:', err.message);
            }
        });

        var msg = {
            'action': RPC_TWEET_ACTION.DELETE_TWEET,
            'payload': {
                'id': tweetId,
                'username': cookie[1]
            }
        }
        dispatcher.dispatch(AMQP_TWEET_QUEUE, JSON.stringify(msg), (response) => {
            //delete associate media if exists
            response = JSON.parse(response);
            if(response.media != null) {
                media.remove(response.media);
            }

            if(response.status == STATUS_OK)    res.status(200).json(response);
            else    res.status(400).json(response);
        });
    }
    else {
        var response = utils.generateMessage(STATUS_ERROR, ERROR_NOT_YET_LOGIN_MESSAGE);
        res.status(400).json(response);
    }
}

exports.like = function(req, res) {
    var cookie = auth.checkLogin(req);
    if(cookie[0]) {
        var tweetId = req.params.id;
        var input_data = req.body;
        var msg = {
            'action': RPC_TWEET_ACTION.LIKE_TWEET,
            'payload': {
                ...input_data,
                'id': tweetId,
                'username': cookie[1]
            }
        }
        // If the tweet is cached, invalidate it.
        dispatcher.dispatch(AMQP_TWEET_QUEUE, JSON.stringify(msg), (response) => {
            res.json(JSON.parse(response));
        });
        memcached.del(utils.MCDtweetKey(tweetId), function(err){
            if(err){
                console.error('[Cache] Cache error:', err.message);
            }
        });
    }
    else {
        var response = utils.generateMessage(STATUS_ERROR, ERROR_NOT_YET_LOGIN_MESSAGE);
        res.json(response);
    }
}

exports.search = function(req, res) {
    var cookie = auth.checkLogin(req);
    var input_data = req.body;
    var following = input_data.following == null ? true : input_data.following;

    if((cookie[0] && following) || (!following)) {
        if(cookie[0] && following) {
            input_data.user = cookie[1];
        }
        var msg = {
            'action': RPC_TWEET_ACTION.SEARCH,
            'payload': input_data
        }
        dispatcher.dispatch(AMQP_TWEET_QUEUE, JSON.stringify(msg), (response) => {
            res.json(JSON.parse(response));
        });
    }
    else {
        var response = utils.generateMessage(STATUS_ERROR, ERROR_NOT_YET_LOGIN_MESSAGE);
        res.json(response);
    }
}