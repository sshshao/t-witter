import pika
import configparser
import sys, os
from cerberus import Validator
import smtplib
import email.message
import email.utils
import time

from protocols.schema import *
from protocols.rpc_protocols import decode_json

v = Validator()

config = configparser.ConfigParser()
config.read("config.ini")
config_email = config['EMAIL']

AMQP_Host = config['AMQP']['AMQP_Host']
AMQP_Exchange = config['AMQP']['AMQP_Exchange']
AMQP_Exchange_Type = config['AMQP']['AMQP_Exchange_Type']
AMQP_Queue = config_email['AMQP_Queue']
Gmail_User = config_email['Gmail_User']
Gmail_Password = config_email['Gmail_Password']


while True:
    try:
        connection = pika.BlockingConnection(pika.ConnectionParameters(host=AMQP_Host))
        break
    except Exception as err:
        print("[x] AMQP Service Not Ready...")
        
channel = connection.channel()

channel.exchange_declare(exchange=AMQP_Exchange, exchange_type=AMQP_Exchange_Type)
channel.queue_declare(queue=AMQP_Queue, durable=True)
channel.queue_bind(exchange=AMQP_Exchange, queue=AMQP_Queue)
 
def callback(ch, method, properties, body):
    try:
        payload = decode_json(body.decode('utf-8'))
        if not v.validate(payload, Email_Schema):
            raise ValueError()

        msg = email.message.Message()
        #msg['From'] = "ubuntu@docker-1.cloud.compas.cs.stonybrook.edu"
        msg['To'] = payload['email']
        msg['Subject'] = payload['title']
        msg.add_header('Content-Type', 'text')
        msg.set_payload(payload['content'])

        smtp_obj = smtplib.SMTP("docker-1")
        smtp_obj.sendmail(msg['From'], [msg['To']], msg.as_string())
        smtp_obj.close()
    except ValueError:
        print("Malformed Payload. Ignored.")
    ch.basic_ack(delivery_tag = method.delivery_tag)


channel.basic_qos(prefetch_count=1)
channel.basic_consume(callback, queue=AMQP_Queue)
print("[x] Email Sending Service Starts Listening...")
channel.start_consuming()