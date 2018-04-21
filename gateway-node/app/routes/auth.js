import { generateMessage } from '../protocols/utils';
import { dispatch } from './dispatcher';

const AMQP_AUTH_QUEUE = require('../config').auth.AMQP_Queue;
const RPC_AUTH_ACTION = require('../protocols/rpc_protocols').RPC_Auth_Action;

export function checkLogin(req) {
    //jwt
}

export function register(req, res) {
    var input_data = req.body;
    var msg = {
        'action': RPC_AUTH_ACTION.REGISTER,
        'payload': input_data
    };
    dispatch(AMQP_AUTH_QUEUE, msg, (resposne) => {
        res.json(JSON.parse(response));
    });
}

export function login(req, res) {
    var input_data = req.body;
    var msg = {
        'action': RPC_AUTH_ACTION.LOG_IN,
        'payload': input_data
    };
    dispatch(AMQP_AUTH_QUEUE, msg, (response) => {
        //assign jwt
        res.json(JSON.parse(response));
    });
}

export function logout(req, res) {
    //jwt
}

export function verify(req, res) {
    var input_data = req.body;
    var msg = {
        'action': RPC_AUTH_ACTION.VALIDATE,
        'payload': input_data
    };
    dispatch(AMQP_AUTH_QUEUE, msg, (response) => {
        res.json(JSON.parse(response));
    });
}