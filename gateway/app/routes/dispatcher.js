var amqp = require('amqplib/callback_api');

const AMQP_HOST = require('../config').amqp.AMQP_Host;
const AMQP_EXCHANGE = require('../config').amqp.AMQP_Exchange;
const AMQP_EXCHANGE_MODE = require('../config').amqp.AMQP_Exchange_Type;

var connection = null;

function startConnection() {
    return new Promise(function(resolve, reject) {
        console.log('AMQP check: ' + amqp);
        console.log('AMQP_HOST check: ' + AMQP_HOST);
        console.log('connection check: ' + connection);

        amqp.connect(AMQP_HOST, function(err, conn) {
            if(err) {
                console.log('[AMQP Error] ' + err);
                //return setTimeout(startConnection(callback), 500);
                return;
            }

            console.log('[x] AMQP connection established.');

            conn.on('error', function(err) {
                if (err.message !== 'Connection closing') {
                    console.error('[AMQP] Connection error:', err.message);
                }
            });
            conn.on('close', function() {
                console.error('[AMQP] Reconnecting...');
                startConnection.then(resolve());
                return;
            });

            connection = conn;
            resolve();
        });
    });
}

function startChannel(service, payload, callback) {
    connection.createConfirmChannel(function(err, ch) {
        if(err) {
            console.error('[AMQP] Create channal error ' + err.message);
            //return setTimeout(startConnection, 100);
            return;
        }

        ch.consume('amq.rabbitmq.reply-to', function(msg) {
            //console.log(' [.] Responding %s', msg.content.toString());
            callback(msg.content.toString());
            ch.close();
        }, {noAck: true});
        
        ch.publish('', service, new Buffer(payload),
            {replyTo: 'amq.rabbitmq.reply-to', persistent: true});
        console.log(" [x] Sending to %s: '%s'", service, JSON.stringify(payload));
    });
}

exports.dispatch = function(service, payload, callback) {
    console.log('[x] Sending request: ' + payload);

    if(connection == null) {
        startConnection.then(startChannel(service, payload, callback));
        /*
        startConnection(function() {
            startChannel(service, payload, callback);
        });
        */
    }
    else {
        startChannel(service, payload, callback);
    }
}