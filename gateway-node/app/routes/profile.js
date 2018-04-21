import { checkLogin } from './auth';

const AMQP_PROFILE_QUEUE = require('../config').profile.AMQP_Queue;
const RPC_PROFILE_ACTION = require('../protocols/rpc_protocols').RPC_Profile_Action;

const STATUS_OK = 'OK';
const STATUS_ERROR = "error";

export function getUser(req, res) {
    var username = req.params.username;
    var msg = {
        'action': RPC_PROFILE_ACTION.GET_PROFILE,
        'payload': {
            'username': username
        }
    }
    dispatch(AMQP_PROFILE_QUEUE, msg, (resposne) => {
        res.json(JSON.parse(response));
    });
}

export function getFollower(req, res) {
    var username = req.params.username;
    var input_data = req.body;
    var msg = {
        'action': RPC_PROFILE_ACTION.GET_FOLLOWER,
        'payload': {
            ...input_data,
            'username': username
        }
    }
    dispatch(AMQP_PROFILE_QUEUE, msg, (resposne) => {
        res.json(JSON.parse(response));
    });
}

export function getFollowing(req, res) {
    var username = req.params.username;
    var input_data = req.body;
    var msg = {
        'action': RPC_PROFILE_ACTION.GET_FOLLOWING,
        'payload': {
            ...input_data,
            'username': username
        }
    }
    dispatch(AMQP_PROFILE_QUEUE, msg, (resposne) => {
        res.json(JSON.parse(response));
    });
}

export function follow(req, res) {
    var cookie = checkLogin(req);
    if(cookie[0]) {
        var input_data = req.body;
        var msg = {
            'action': RPC_PROFILE_ACTION.FOLLOW,
            'payload': {
                'user': cookie[1],
                'target': input_data.username,
                'follow': input_data.follow
            }
        };
        dispatch(AMQP_PROFILE_QUEUE, msg, (resposne) => {
            res.json(JSON.parse(response));
        });
    }
    else {
        var response = generateMessage(STATUS_ERROR, ERROR_NOT_YET_LOGIN_MESSAGE);
        return response;
    }
}