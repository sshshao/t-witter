import pika, uuid
import configparser
import os, sys

config = configparser.ConfigParser()
config.read('config.ini')
config_dispatcher = config['DISPATCHER']
AMQP_HOST = config['AMQP']['AMQP_Host']
AMQP_Exchange = config['AMQP']['AMQP_Exchange']
AMQP_Exchange_Type = config['AMQP']['AMQP_Exchange_Type']

def get_cur_time_milli():
    t_ms = int(time.time() * 1000)
    return t_ms

class RPCDispatcher(object):
    def __init__(self, ):
        bf_time = get_cur_time_milli()
        self.connection = pika.BlockingConnection(
            pika.ConnectionParameters(host=AMQP_HOST))
        af_time = get_cur_time_milli()
        sys.stderr.write("RPC Connection Creation Takes: %d ms\n" % (af_time - bf_time))

        bf_time = get_cur_time_milli()
        self.channel = self.connection.channel()
        af_time = get_cur_time_milli()
        sys.stderr.write("RPC Channel Creation Takes: %d ms\n" % (af_time - bf_time))

        bf_time = get_cur_time_milli()
        self.channel.basic_consume(
            self.on_response,
            queue='amq.rabbitmq.reply-to',
            no_ack=True)
        af_time = get_cur_time_milli()
        sys.stderr.write("RPC Callback and Queue Binding Takes: %d ms\n" % (af_time - bf_time))
    
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
    
    def close(self):
        self.connection.close()