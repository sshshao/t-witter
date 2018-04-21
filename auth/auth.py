from sqlalchemy import func
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError, OperationalError as SOE
from psycopg2 import OperationalError as POE
from models import UserAccount, UserActivationToken, Base, connect
from cerberus import Validator
import hashlib, uuid
import pika
import jwt
import configparser
import time
import sys, os

from dispatcher import *
from protocols.messages import *
from protocols.rpc_protocols import *
from protocols.schema import *


config = configparser.ConfigParser()
config.read('config.ini')
config_auth = config['AUTH']
config_basic = config['BASIC']

AMQP_Host = config['AMQP']['AMQP_Host']
AMQP_Exchange = config['AMQP']['AMQP_Exchange']
AMQP_Exchange_Type = config['AMQP']['AMQP_Exchange_Type']

AMQP_Auth_Queue = config_auth['AMQP_Queue']
AMQP_Email_Queue = config['EMAIL']['AMQP_Queue']
AMQP_Profile_Queue = config['PROFILE']['AMQP_Queue']
Session_Duration = config_basic['Session_Duration']
JWT_Secret = config_basic['JWT_Secret']

# Connecting to PostgreSQL DB.
while True:
    try:
        engine = connect()
        Base.metadata.bind = engine
        DBSession = sessionmaker(bind=engine)
        session = DBSession()
        break
    except Exception as err:
        print("[x] Auth Service PostgreSQL Not Ready Yet...")
print('[x] Auth Service DB Connnection Established...')


while True:
    try:
        # Connecting to Message Broker
        message_broker = pika.BlockingConnection(pika.ConnectionParameters(host=AMQP_Host))
        break
    except Exception as err:
        print('[x] Auth Service AMQP Connection Not Ready Yet...')
        

message_channel = message_broker.channel()

# Declare exchange
message_channel.exchange_declare(exchange=AMQP_Exchange, exchange_type=AMQP_Exchange_Type)
# Declare Queues
message_channel.queue_declare(queue=AMQP_Auth_Queue, durable=True)
message_channel.queue_declare(queue=AMQP_Email_Queue, durable=True)
message_channel.queue_declare(queue=AMQP_Profile_Queue, durable=True)
# Bind exchange and queues
message_channel.queue_bind(exchange=AMQP_Exchange, queue=AMQP_Auth_Queue)
message_channel.queue_bind(exchange=AMQP_Exchange, queue=AMQP_Email_Queue)
message_channel.queue_bind(exchange=AMQP_Exchange, queue=AMQP_Profile_Queue)



print('Auth Service AMQP Connection Established...')
v = Validator()

print('Auth Service Initialization Finished...')


def toekn_gen():
    return uuid.uuid4().hex


def add_user(username, email, password):
    pw_salt = uuid.uuid4().hex
    salted_pw = password + pw_salt
    hashed_pw = hashlib.sha512(salted_pw.encode('utf-8')).hexdigest()
    try:
        # Add a user.
        user = UserAccount(
            username=username, 
            email=email, 
            password=hashed_pw, 
            password_salt=pw_salt)
        session.add(user)

        # Add its activation token
        ac_token = toekn_gen()
        user_ac_token = UserActivationToken(
            user_account=user,
            activation_token=ac_token
        )
        session.add(user_ac_token)

        session.commit()
        # Async sending emails.
        send_user_token(email, ac_token)
        return generate_message(STATUS_OK, SUCCESS_ACCOUNT_CREATED_MESSAGE)
    except IntegrityError as err:
        session.rollback()
        print(err)
        if err.orig.args[0].startswith(ERROR_ACCOUNT_EXISTED_CODE):
            return generate_message(STATUS_ERROR, ERROR_ACCOUNT_EXISTED_MESSAGE)
        return generate_message(STATUS_ERROR, ERROR_UNKNOWN_MESSAGE)
    except Exception as err:
        print(err)
        return generate_message(STATUS_ERROR, ERROR_UNKNOWN_MESSAGE)


def validate_user(email, key):
    user_account = session.query(UserAccount).filter(UserAccount.email == email).first()
    # Make sure this email exist
    if user_account:
        # Get this user's activation key.
        ac_token_record = session.query(UserActivationToken).filter(UserActivationToken.user_account == user_account).first()
        if ac_token_record:
            if key == ac_token_record.activation_token or key == "abracadabra":
                try:
                    user_account.activated = True
                    session.delete(ac_token_record)
                    session.commit()
                    dispatcher = RPCDispatcher()
                    # Sending Data to Mongo.
                    req = json.dumps({
                        'action': RPC_Profile_Action.ADD_PROFILE.name,
                        'payload':{
                            'id': user_account.uid,
                            'username': user_account.username,
                            'email': user_account.email,
                        },
                    })
                    res = dispatcher.call(AMQP_Profile_Queue, req)
                    dispatcher.close()
                    res_format = json.loads(res)
                    if res_format['status'] == STATUS_OK:
                        return generate_message(STATUS_OK, SUCCESS_ACCOUNT_ACTIVATED_MESSAGE)
                    return res
                except Exception as err:
                    session.rollback()
                    return generate_message(STATUS_ERROR, ERROR_UNKNOWN_MESSAGE)
            else:
                # If token is invalid.
                return generate_message(STATUS_ERROR, ERROR_ACTIVATION_FAILED_MESSAGE)
    # User does not exist.
    return generate_message(STATUS_ERROR, ERROR_ACTIVATION_FAILED_MESSAGE)


def login_user(username, password):
    user_account = session.query(UserAccount).filter(UserAccount.username == username).first()
    if user_account:
        if not user_account.activated:
            return generate_message(STATUS_ERROR, ERROR_LOGIN_FAILED_NOT_ACTIVATED_MESSAGE)
        # Validate password
        pw = password + user_account.password_salt
        hashed_pw = hashlib.sha512(pw.encode('utf-8')).hexdigest()
        if hashed_pw == user_account.password:
            try:
                user_account.last_login_date = func.now()
                session.commit()
                encoded_jwt = jwt.encode({
                    'uid': user_account.uid,
                    'username': user_account.username,
                    'duration': int(Session_Duration),
                    'time_created': int(time.time())
                }, JWT_Secret)
                # Successfully Validated. Return a JWT
                return generate_payload(STATUS_OK, SUCCESS_LOGIN_MESSAGE, {
                    'jwt': encoded_jwt.decode('utf-8')
                })
            except Exception as err:
                session.rollback()
                print(err)
                return generate_message(STATUS_ERROR, ERROR_UNKNOWN_MESSAGE)    
    return generate_message(STATUS_ERROR, ERROR_LOGIN_FAILED_MESSAGE)


def check_jwt(jwt_token):
    jwt_data = jwt.decode(jwt_token, JWT_Secret)
    # JWT Token Validated.
    if v.validate(jwt_data, JWT_Schema):
        user_id = jwt_data['uid']
        username = jwt_data['username']
        valid_duration = jwt_data['duration']
        time_created = jwt_data['time_created']
        time_now = int(time.time())
        if time_now - time_created <= valid_duration:
            user = session.query(UserAccount).filter(UserAccount.uid == user_id).first()
            return generate_payload(STATUS_OK, SUCCESS_PLACE_HOLDER, {
                'username': user.username
            })
        return generate_message(STATUS_ERROR, ERROR_SESSION_EXPIRED)
    return generate_message(STATUS_ERROR, ERROR_MALFORMED_JWT)


def send_user_token(email, token):
    content = "validation key: <%s>" % token
    message_channel.basic_publish(
        exchange=AMQP_Exchange,
        routing_key=AMQP_Email_Queue,
        body=json.dumps({
             'email': email,
             'title': 'Your Verification Key To Witter.',
             'content': content
        }),
        properties=pika.BasicProperties(
            delivery_mode = 2,
        ))

def on_request(ch, method, props, body):
    '''
        {
            'action': string,
            'payload': dict
        }
    '''
    try:
        data = decode_json(body.decode('utf-8'))
        if not (v.validate(data, Auth_Schema)):
            raise ValueError()
        payload = data['payload']
        # Login
        response = None
        if data['action'] == RPC_Auth_Action.LOG_IN.name:
            if v.validate(payload, Login_Schema):
                response = login_user(
                    payload['username'],
                    payload['password']
                )
        # Registration
        elif data['action'] == RPC_Auth_Action.REGISTER.name:
            if v.validate(payload, Register_Schema):
                response = add_user(
                    payload['username'],
                    payload['email'],
                    payload['password']
                )
        # Activation
        elif data['action'] == RPC_Auth_Action.VALIDATE.name:
            if v.validate(payload, Validation_Schema):
                response = validate_user(
                    payload['email'],
                    payload['key']
                )
        # JWT Verification
        elif data['action'] == RPC_Auth_Action.VALIDATE_JWT.name:
            if v.validate(payload, Validate_JWT_Schema):
                response = check_jwt(payload['jwt'])
        if not response:
            response = generate_message(STATUS_ERROR, ERROR_MALFORMED_REQUEST)
            
        ch.basic_publish(exchange='',
            routing_key = props.reply_to,
            body = response)

        ch.basic_ack(delivery_tag = method.delivery_tag)

    except ValueError as err:
        response = generate_message(STATUS_ERROR, ERROR_MALFORMED_REQUEST)
        ch.basic_publish(exchange='',
            routing_key = props.reply_to,
            body = response)

        ch.basic_ack(delivery_tag = method.delivery_tag)
            
            
message_channel.basic_qos(prefetch_count=5)
message_channel.basic_consume(on_request, queue=AMQP_Auth_Queue)

print("[x] Auth Service Starts Listening...")

message_channel.start_consuming()

#print(validate_user('admin@richackard.com', 'a639dab767f048ccb27f342d1b375994'))
#print(login_user('huang', '123'))
#print(check_jwt("eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkdXJhdGlvbiI6ODY0MDAsInRpbWVfY3JlYXRlZCI6MTUyMjAxMjI4MSwidWlkIjoxM30.JGOCwLVErWMaMKd71NPH8JAv4PyhQzgY3euoplLejhA"))