import { generateMessage } from '../protocols/utils';
import { dispatch } from './dispatcher';
import { checkLogin } from './auth';
import { remove as removeMedia } from './media'; 

const AMQP_TWEET_QUEUE = require('../config').tweet.AMQP_Queue;
const RPC_TWEET_ACTION = require('../protocols/rpc_protocols').RPC_Tweet_Action;
const ERROR_NOT_YET_LOGIN_MESSAGE = require('../protocols/messages').ERROR_NOT_YET_LOGIN_MESSAGE;

const STATUS_OK = 'OK';
const STATUS_ERROR = "error";

export function post(req, res) {
    var cookie = checkLogin(req);
    if(cookie[0]) {
        var input_data = req.body;
        var msg = {
            'action': RPC_TWEET_ACTION.ADD_TWEET,
            'payload': {
                ...input_data,
                'username': cookie[1]
            }
        };
        dispatch(AMQP_TWEET_QUEUE, msg, (resposne) => {
            res.json(JSON.parse(response));
        });
    }
    else {
        var response = generateMessage(STATUS_ERROR, ERROR_NOT_YET_LOGIN_MESSAGE);
        return response;
    }
}

export function get(req, res) {
    var tweetId = req.params.id;
    var msg = {
        'action': RPC_TWEET_ACTION.GET_TWEET,
        'payload': {
            'id': tweetId
        }
    }
    dispatch(AMQP_TWEET_QUEUE, msg, (resposne) => {
        res.json(JSON.parse(response));
    });
}

export function remove(req, res) {
    var cookie = checkLogin(req);
    if(cookie[0]) {
        var tweetId = req.param.id;
        var msg = {
            'action': RPC_TWEET_ACTION.GET_TWEET,
            'payload': {
                'id': tweetId,
                'username': cookie[1]
            }
        }
        dispatch(AMQP_TWEET_QUEUE, msg, (resposne) => {
            //delete associate media if exists
            response = JSON.parse(response);
            if(response.media != null) {
                removeMedia(response.media);
            }

            if(response.status == STATUS_OK)    res.status(200).json(response);
            else    res.status(400).json(response);
        });
    }
    else {
        var response = generateMessage(STATUS_ERROR, ERROR_NOT_YET_LOGIN_MESSAGE);
        return response;
    }
}

export function like(req, res) {
    var cookie = checkLogin(req);
    if(cookie[0]) {
        var tweetId = req.param.id;
        var input_data = req.body;
        var msg = {
            'action': RPC_TWEET_ACTION.LIKE_TWEET,
            'payload': {
                ...input_data,
                'id': tweetId,
                'username': cookie[1]
            }
        }
        dispatch(AMQP_TWEET_QUEUE, msg, (resposne) => {
            res.json(JSON.parse(response));
        });
    }
    else {
        var response = generateMessage(STATUS_ERROR, ERROR_NOT_YET_LOGIN_MESSAGE);
        return response;
    }
}

export function search(req, res) {
    var cookie = checkLogin(req);
    var input_data = req.body;
    var following = input_data.following == null ? true : input_data.following;

    if((cookie[0] && following) || (!following)) {
        if(cookie[0] && following) {
            input_data.user = cookie[1];
            var msg = {
                'action': RPC_TWEET_ACTION.SEARCH,
                'payload': input_data
            }
            dispatch(AMQP_TWEET_QUEUE, msg, (resposne) => {
                res.json(JSON.parse(response));
            });
        }
    }
    else {
        var response = generateMessage(STATUS_ERROR, ERROR_NOT_YET_LOGIN_MESSAGE);
        return response;
    }
}