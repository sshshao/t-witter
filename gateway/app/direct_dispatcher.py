import pika, uuid
import configparser
import os

config = configparser.ConfigParser()
config.read('config.ini')
config_dispatcher = config['DISPATCHER']
AMQP_HOST = config['AMQP']['AMQP_Host']
AMQP_Exchange = config['AMQP']['AMQP_Exchange']
AMQP_Exchange_Type = config['AMQP']['AMQP_Exchange_Type']

class RPCDispatcher(object):
    def __init__(self, ):
        self.connection = pika.BlockingConnection(
            pika.ConnectionParameters(host=AMQP_HOST))

        self.channel = self.connection.channel()

        self.channel.basic_consume(
            'amq.rabbitmq.reply-to',
            self.on_response,
            no_ack=True)
    
    def on_response(self, ch, method, props, body):
        self.response = body

    def call(self, service, payload):
        self.response = None
        self.channel.basic_publish(
            exchange='',
            routing_key=service,
            properties=pika.BasicProperties(
                reply_to="amq.rabbitmq.reply-to"),
            body=str(payload))
        while self.response is None:
            self.connection.process_data_events()
        return str(self.response.decode('utf-8'))