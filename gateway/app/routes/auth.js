const dispatcher = require('./dispatcher');
const AMQP_AUTH_QUEUE = require('../config').auth.AMQP_Queue;
const RPC_AUTH_ACTION = require('../protocols/rpc_protocols').RPC_Auth_Action;

exports.checkLogin = function(req) {
    //jwt
    return null;
}

exports.register = function(req, res) {
    var input_data = req.body;
    var msg = {
        'action': RPC_AUTH_ACTION.REGISTER,
        'payload': input_data
    };
    dispatcher.dispatch(AMQP_AUTH_QUEUE, msg, (resposne) => {
        res.json(JSON.parse(response));
    });
}

exports.login = function(req, res) {
    var input_data = req.body;
    var msg = {
        'action': RPC_AUTH_ACTION.LOG_IN,
        'payload': input_data
    };
    dispatcher.dispatch(AMQP_AUTH_QUEUE, msg, (response) => {
        //assign jwt
        res.json(JSON.parse(response));
    });
}

exports.logout = function(req, res) {
    //jwt
}

exports.verify = function(req, res) {
    var input_data = req.body;
    var msg = {
        'action': RPC_AUTH_ACTION.VALIDATE,
        'payload': input_data
    };
    dispatcher.dispatch(AMQP_AUTH_QUEUE, msg, (response) => {
        res.json(JSON.parse(response));
    });
}