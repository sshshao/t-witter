var amqp = require('amqplib/callback_api');

const AMQP_HOST = require('../config').amqp.AMQP_Host;
const AMQP_EXCHANGE = require('../config').amqp.AMQP_Exchange;
const AMQP_EXCHANGE_MODE = require('../config').amqp.AMQP_Exchange_Type;

var connection = null;

function startConnection(callback) {
    console.log('AMQP check: ' + amqp);
    console.log('AMQP_HOST check: ' + AMQP_HOST);
    console.log('connection check: ' + connection);

    amqp.connect(AMQP_HOST, function(err, conn) {
        if(err) {
            console.error('[AMQP Error] ' + err);
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
            //return setTimeout(startConnection(callback), 100);
            return;
        });

        connection = conn;
        callback();
    });
}

function startChannel(service, payload) {
    return new Promise(function(resolve, reject) {
        connection.createConfirmChannel(function(err, ch) {
            if(err) {
                console.error('[AMQP] Channal error: ' + err.message);
                reject();
            }
    
            ch.consume('amq.rabbitmq.reply-to', function(msg) {
                //console.log(' [.] Responding %s', msg.content.toString());
                resolve(msg.content.toString());
                ch.close();
            }, {noAck: true});
            
            ch.publish('', service, new Buffer(payload),
                {replyTo: 'amq.rabbitmq.reply-to', persistent: true});
            //console.log("[x] Sending to %s: '%s'", service, JSON.stringify(payload));
        });
    });
}

exports.dispatch = function(service, payload, callback) {
    if(connection == null) {
        startConnection(function() {
            startChannel(service, payload).then(callback);
        });
    }
    else {
        startChannel(service, payload).then(callback, function() {
            startConnection(function() {
                startChannel(service, payload).then(callback);
            });
        });
    }
}