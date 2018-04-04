import pika, uuid
import configparser

config = configparser.ConfigParser()
config.read('config.ini')
config_dispatcher = config['DISPATCHER']
AMQP_HOST = config['AMQP']['AMQP_Host']
AMQP_Exchange = config['AMQP']['AMQP_Exchange']
AMQP_Exchange_Type = config['AMQP']['AMQP_Exchange_Type']

class RPCDispatcher(object):
    def __init__(self):
        self.connection = pika.BlockingConnection(
            pika.ConnectionParameters(host=AMQP_HOST))
        self.channel = self.connection.channel()

        self.channel.exchange_declare(exchange=AMQP_Exchange,
            exchange_type=AMQP_Exchange_Type)

        result = self.channel.queue_declare(durable=True, exclusive=True)
        self.channel.queue_bind(exchange=AMQP_Exchange, queue=result.method.queue)

        self.callback_queue = result.method.queue

        self.channel.basic_consume(self.on_response,
            queue = self.callback_queue)
    
    def on_response(self, ch, method, props, body):
        if self.corr_id == props.correlation_id:
            self.response = body

    def call(self, service, payload):
        self.response = None
        self.corr_id = str(uuid.uuid4())
        self.channel.basic_publish(exchange=AMQP_Exchange,
            routing_key=service,
            properties=pika.BasicProperties(
                reply_to=self.callback_queue,
                correlation_id=self.corr_id),
            body=str(payload))
        while self.response is None:
            self.connection.process_data_events()
        return str(self.response.decode('utf-8'))