var Memcached = require('memcached');
const utils = require('../protocols/utils');
const dispatcher = require('./dispatcher');
const auth = require('./auth');

const AMQP_PROFILE_QUEUE = require('../config').profile.AMQP_Queue;
const RPC_PROFILE_ACTION = require('../protocols/rpc_protocols').RPC_Profile_Action;
const MCD_HOST = require('../config').memcached.Mcd_Host;

const STATUS_OK = 'OK';
const STATUS_ERROR = 'error';

var mcd_options = {retries: 10, retry: 10000, poolSize: 50};
var memcached = new Memcached(MCD_HOST, mcd_options);

exports.getUser = function(req, res) {
    var username = req.params.username;
    memcached.get(utils.MCDprofileKey(username), function(err, user) {
        if(err) {
            console.error('[Cache] Cache error:', err.message);
        }

        if(user != null) {
            res.json(user);
        }
        else {
            var msg = {
                'action': RPC_PROFILE_ACTION.GET_PROFILE,
                'payload': {
                    'username': username
                }
            }
            dispatcher.dispatch(AMQP_PROFILE_QUEUE, JSON.stringify(msg), (response) => {
                response = JSON.parse(response);
                memcached.add(utils.MCDprofileKey(response.user.username), response.user, 3, function(err) {
                    if(err) {
                        console.error('[Cache] Cache error:', err.message);
                    }
                });
                res.json(response);
            });
        }
    });
}

exports.getFollower = function(req, res) {
    var username = req.params.username;
    var input_data = req.body;
    var msg = {
        'action': RPC_PROFILE_ACTION.GET_FOLLOWER,
        'payload': {
            ...input_data,
            'username': username
        }
    }
    dispatcher.dispatch(AMQP_PROFILE_QUEUE, JSON.stringify(msg), (response) => {
        res.json(JSON.parse(response));
    });
}

exports.getFollowing = function(req, res) {
    var username = req.params.username;
    var input_data = req.body;
    var msg = {
        'action': RPC_PROFILE_ACTION.GET_FOLLOWING,
        'payload': {
            ...input_data,
            'username': username
        }
    }
    dispatcher.dispatch(AMQP_PROFILE_QUEUE, JSON.stringify(msg), (response) => {
        res.json(JSON.parse(response));
    });
}

exports.follow = function(req, res) {
    var cookie = auth.checkLogin(req);
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
        dispatcher.dispatch(AMQP_PROFILE_QUEUE, JSON.stringify(msg), (response) => {
            res.json(JSON.parse(response));
        });
    }
    else {
        var response = generateMessage(STATUS_ERROR, ERROR_NOT_YET_LOGIN_MESSAGE);
        res.json(response);
    }
}