const utils = require('../protocols/utils');
const dispatcher = require('./dispatcher');
const auth = require('./auth');
const media = require('./media');

const AMQP_TWEET_QUEUE = require('../config').tweet.AMQP_Queue;
const RPC_TWEET_ACTION = require('../protocols/rpc_protocols').RPC_Tweet_Action;
const ERROR_NOT_YET_LOGIN_MESSAGE = require('../protocols/messages').ERROR_NOT_YET_LOGIN_MESSAGE;

const STATUS_OK = 'OK';
const STATUS_ERROR = 'error';

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
            res.json(JSON.parse(response));
        });
    }
    else {
        var response = utils.generateMessage(STATUS_ERROR, ERROR_NOT_YET_LOGIN_MESSAGE);
        return response;
    }
}

exports.get = function(req, res) {
    var tweetId = req.params.id;
    var msg = {
        'action': RPC_TWEET_ACTION.GET_TWEET,
        'payload': {
            'id': tweetId
        }
    }
    dispatcher.dispatch(AMQP_TWEET_QUEUE, JSON.stringify(msg), (response) => {
        res.json(JSON.parse(response));
    });
}

exports.remove = function(req, res) {
    var cookie = auth.checkLogin(req);
    if(cookie[0]) {
        var tweetId = req.params.id;
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
                meida.remove(response.media);
            }

            if(response.status == STATUS_OK)    res.status(200).json(response);
            else    res.status(400).json(response);
        });
    }
    else {
        var response = utils.generateMessage(STATUS_ERROR, ERROR_NOT_YET_LOGIN_MESSAGE);
        return response;
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
        dispatcher.dispatch(AMQP_TWEET_QUEUE, JSON.stringify(msg), (response) => {
            res.json(JSON.parse(response));
        });
    }
    else {
        var response = utils.generateMessage(STATUS_ERROR, ERROR_NOT_YET_LOGIN_MESSAGE);
        return response;
    }
}

exports.search = function(req, res) {
    var cookie = auth.checkLogin(req);
    var input_data = req.body;
    var following = input_data.following == null ? true : input_data.following;

    if((cookie[0] && following) || (!following)) {
        if(cookie[0] && following) {
            input_data.user = cookie[1];
            var msg = {
                'action': RPC_TWEET_ACTION.SEARCH,
                'payload': input_data
            }
            dispatcher.dispatch(AMQP_TWEET_QUEUE, JSON.stringify(msg), (response) => {
                res.json(JSON.parse(response));
            });
        }
    }
    else {
        var response = utils.generateMessage(STATUS_ERROR, ERROR_NOT_YET_LOGIN_MESSAGE);
        return response;
    }
}