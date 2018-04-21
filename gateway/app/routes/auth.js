const jwt = require('jsonwebtoken');
const dispatcher = require('./dispatcher');
const utils = require('../protocols/utils');

const AMQP_AUTH_QUEUE = require('../config').auth.AMQP_Queue;
const RPC_AUTH_ACTION = require('../protocols/rpc_protocols').RPC_Auth_Action;
const JWT_SECRET = require('../config').basic.JWT_Secret;
const SUCCESS_LOGOUT_MESSAGE = require('../protocols/messages').SUCCESS_LOGOUT_MESSAGE;
const ERROR_NOT_YET_LOGIN_MESSAGE = require('../protocols/messages').ERROR_NOT_YET_LOGIN_MESSAGE;

const STATUS_OK = 'OK';
const STATUS_ERROR = 'error';

exports.checkLogin = function(req) {
    if(req.cookies != null) {
        try {
            var decoded = jwt.verify(req.cookies, JWT_SECRET);
            //todo: check duration
            return [true, decoded.username];
        } catch(err) {
            return [false, null];
        }
    }
    else {
        return [false, null];
    }
}

exports.register = function(req, res) {
    var input_data = req.body;
    var msg = {
        'action': RPC_AUTH_ACTION.REGISTER,
        'payload': input_data
    };
    dispatcher.dispatch(AMQP_AUTH_QUEUE, JSON.stringify(msg), (resposne) => {
        res.json(JSON.parse(response));
    });
}

exports.login = function(req, res) {
    var input_data = req.body;
    var msg = {
        'action': RPC_AUTH_ACTION.LOG_IN,
        'payload': input_data
    };
    dispatcher.dispatch(AMQP_AUTH_QUEUE, JSON.stringify(msg), (response) => {
        //assign jwt
        response = JSON.parse(response);
        if(response.status == STATUS_OK) {
            res.cookie('user-jwt', response.payload.jwt);
        }
        res.json(response);
    });
}

exports.logout = function(req, res) {
    var r;
    if(req.cookies != null) {
        res.clearCookie('user-jwt');
        r = utils.generateMessage(STATUS_OK, SUCCESS_LOGOUT_MESSAGE);
    }
    else {
        r = utils.generateMessage(STATUS_ERROR, ERROR_NOT_YET_LOGIN_MESSAGE);
    }
}

exports.verify = function(req, res) {
    var input_data = req.body;
    var msg = {
        'action': RPC_AUTH_ACTION.VALIDATE,
        'payload': input_data
    };
    dispatcher.dispatch(AMQP_AUTH_QUEUE, JSON.stringify(msg), (response) => {
        res.json(JSON.parse(response));
    });
}