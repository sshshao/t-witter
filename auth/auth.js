const amqp = require('amqplib/callback_api');
const action = require('./worker');
const utils = require('./protocols/utils');

const AMQP_HOST = require('./config').amqp.AMQP_Host;
const AMQP_EXCHANGE = require('./config').amqp.AMQP_Exchange;
const AMQP_EXCHANGE_TYPE = require('./config').amqp.AMQP_Exchange_Type;
const AMQP_AUTH_QUEUE = require('./config').auth.AMQP_Queue;
const AUTH_ACTION = require('./protocols/rpc_protocols').RPC_Auth_Action;

const STATUS_OK = 'OK';
const STATUS_ERROR = 'error';

amqp.connect(AMQP_HOST, function(err, conn) {
    if(err) throw err;

    console.log('[.] connection established');
    conn.createChannel(function(err, ch) {
        if(err) throw err;

        console.log("[.] channel created");
        //ch.assertExchange(AMQP_EXCHANGE, AMQP_EXCHANGE_TYPE, {durable: false});
        ch.assertQueue(AMQP_AUTH_QUEUE, {durable: true, exclusive: false});
        //ch.bindQueue(q.queue, '', AMQP_AUTH_QUEUE);
        ch.prefetch(5);
        console.log('[.] Waiting for request');

        ch.consume(AMQP_AUTH_QUEUE, function(msg) {
            var request = JSON.parse(msg.content.toString('utf8'));
            //console.log(' [x] Received request: "%s"', JSON.stringify(request));
            
            sendTask(request, function(response) {
                //console.log(JSON.stringify(response));
                ch.sendToQueue(msg.properties.replyTo, new Buffer(JSON.stringify(response)));
            });
            //ch.ack(msg);
        }, {noAck: true});
    });
});


function sendTask(req, callback) {
    switch(req.action) {
        case AUTH_ACTION.LOG_IN:
            action.login(req.payload).then(callback);
            break;

        /*
        case AUTH_ACTION.LOG_OUT:
            action.logout(req.payload).then(callback);
            break;
        */

        case AUTH_ACTION.REGISTER:
            action.regiter(req.payload).then(callback);
            break;

        case AUTH_ACTION.VALIDATE:
            action.validate(req.payload).then(callback);
            break;

        /*
        case AUTH_ACTION.VALIDATE_JWT:
            action.validateJwt(req.payload).then(callback);
            break;
        */

        default:
            callback(utils.generateMessage(STATUS_ERROR, 'Action invalid'));
    }
}