var amqp = require('amqplib/callback_api')

const AMQP_HOST = require('../config').amqp.AMQP_Host;
const AMQP_EXCHANGE = require('../config').amqp.AMQP_Exchange;
const AMQP_EXCHANGE_MODE = require('../config').amqp.AMQP_Exchange_Type;

var connection = null;

function startConnection() {
    amqp.connect(AMQP_HOST, function(err, conn) {
        if(err) {
            console.log('[AMQP Error] ' + err);
            return setTimeout(startConnection, 500);
        }

        //outdated function?
        conn.on("error", function(err) {
            if (err.message !== "Connection closing") {
                console.error("[AMQP] Connection error", err.message);
            }
        });
        conn.on("close", function() {
            console.error("[AMQP] Reconnecting...");
            return setTimeout(startConnection, 500);
        });

        connection = conn;
    });
}

exports.dispatch = function(service, payload, callback) {
    connection.createConfirmChannel(function(err, ch) {
        if(err) {
            console.log('[AMQP Error] ' + err);
            return setTimeout(startConnection, 500);
        }

        ch.consume('amq.rabbitmq.reply-to', function(msg) {
            console.log(' [.] Received %s', msg.content.toString());
            callback(ch, msg.content.toString());
            ch.close();
        }, {noAck: false});
        
        ch.publish('', service, new Buffer(payload),
            {replyTo: 'amq.rabbitmq.reply-to', persistent: true});
    });
}