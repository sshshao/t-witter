import configparser
import pika
import json
import sys, os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from worker import *
from protocols.rpc_protocols import *

# Get consts from config file
config = configparser.ConfigParser()
config.read('./config.ini')
config_tweet = config['TWEET']

AMQP_HOST = config['AMQP']['AMQP_Host']
AMQP_EXCHANGE = config['AMQP']['AMQP_Exchange']
AMQP_EXCHANGE_TYPE = config['AMQP']['AMQP_Exchange_Type']
AMQP_TWEET_QUEUE = config_tweet['AMQP_Queue']

# Set up AMQP connection
connection = pika.BlockingConnection(pika.ConnectionParameters(AMQP_HOST))
channel = connection.channel()
channel.exchange_declare(exchange=AMQP_EXCHANGE, exchange_type=AMQP_EXCHANGE_TYPE)
result = channel.queue_declare(queue=AMQP_TWEET_QUEUE, durable=True)
channel.queue_bind(exchange=AMQP_EXCHANGE, queue=AMQP_TWEET_QUEUE)

options = {
    REQ_ACTION.ADD_TWEET.name: add_tweet,
    REQ_ACTION.GET_TWEET.name: get_tweet,
    REQ_ACTION.DELETE_TWEET.name: delete_tweet,
    REQ_ACTION.SEARCH.name: search
}


def on_request(ch, method, props, body):
    data = decode_json(body.decode('utf-8'))
    print(data)
    response = options[data['action']](data['payload'])

    ch.basic_publish(exchange='',
        routing_key=props.reply_to,
        body=response)
    ch.basic_ack(delivery_tag=method.delivery_tag)


channel.basic_qos(prefetch_count=1)
channel.basic_consume(on_request, queue=AMQP_TWEET_QUEUE)

# Start consume
print(" [x] Awaiting RPC requests")
channel.start_consuming()