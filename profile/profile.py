import configparser
import pika
import json
import sys, os

import time

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from worker import *
from protocols.rpc_protocols import *

# Get consts from config file
config = configparser.ConfigParser()
config.read('./config.ini')
config_profile = config['PROFILE']

AMQP_HOST = config['AMQP']['AMQP_Host']
AMQP_EXCHANGE = config['AMQP']['AMQP_Exchange']
AMQP_EXCHANGE_TYPE = config['AMQP']['AMQP_Exchange_Type']
AMQP_PROFILE_QUEUE = config_profile['AMQP_Queue']

# Set up AMQP connection
connection = pika.BlockingConnection(pika.ConnectionParameters(AMQP_HOST))
channel = connection.channel()
channel.exchange_declare(exchange=AMQP_EXCHANGE, exchange_type=AMQP_EXCHANGE_TYPE)
result = channel.queue_declare(queue=AMQP_PROFILE_QUEUE, durable=True)
channel.queue_bind(exchange=AMQP_EXCHANGE, queue=AMQP_PROFILE_QUEUE)

options = {
    REQ_ACTION.ADD_PROFILE.name: add_profile,
    REQ_ACTION.GET_PROFILE.name: get_profile,
    REQ_ACTION.GET_FOLLOWER.name: get_follower,
    REQ_ACTION.GET_FOLLOWING.name: get_following,
    REQ_ACTION.FOLLOW.name: follow
}


def on_request(ch, method, props, body):
    data = decode_json(body.decode('utf-8'))
    print(data)
    
    # distinguish internal and external call
    response = options[data['action']](data['payload'])
    if(data['action'] == REQ_ACTION.ADD_PROFILE.name):
        ch.basic_publish(exchange=AMQP_EXCHANGE,
            routing_key=props.reply_to,
            properties=pika.BasicProperties(
                correlation_id=props.correlation_id),
            body=response)
    else:
        ch.basic_publish(exchange='',
            routing_key=props.reply_to,
            body=response)
    ch.basic_ack(delivery_tag=method.delivery_tag)


channel.basic_qos(prefetch_count=1)
channel.basic_consume(on_request, queue=AMQP_PROFILE_QUEUE)

# Start consume
print(" [x] Awaiting RPC requests")
channel.start_consuming()