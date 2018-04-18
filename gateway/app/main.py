from flask import Flask, request, Response
from cerberus import Validator
import configparser
import json
import sys, os
import jwt
import time

from direct_dispatcher import *
from protocols.rpc_protocols import *
from protocols.messages import *
from protocols.schema import *


app = Flask(__name__)
config = configparser.ConfigParser()
config.read('config.ini')

AMQP_Auth_Queue = config['AUTH']['AMQP_Queue']
AMQP_Tweet_Queue = config['TWEET']['AMQP_Queue']
AMQP_Profile_Queue = config['PROFILE']['AMQP_Queue']
JWT_Secret = config['BASIC']['JWT_Secret']

v = Validator()

def get_cur_time_milli():
    t_ms = int(time.time() * 1000)
    return t_ms


# Check whether the JWT Token is valid.
def check_login(req):
    jwt_token = req.cookies.get('user-jwt')
    if not jwt_token:
        return (False, )
    jwt_data = jwt.decode(jwt_token, JWT_Secret)
    if v.validate(jwt_data, JWT_Schema):
        user_id = jwt_data['uid']
        username = jwt_data['username']
        valid_duration = jwt_data['duration']
        time_created = jwt_data['time_created']
        time_now = int(time.time())
        if time_now - time_created <= valid_duration:
            # Blacklisted TODO
            return (True, username)
    return (False, )


@app.route('/test', methods=['GET'])
def hello():
    return 'Hello World!'


@app.route('/adduser', methods=['POST'])
def register():
    input_data = request.get_json() 
    dispatcher = RPCDispatcher()
    req = json.dumps({
        'action': RPC_Auth_Action.REGISTER.name,
        'payload': input_data
    })
    res = dispatcher.call(AMQP_Auth_Queue, req)
    dispatcher.close()
    return Response(res, mimetype='application/json')


@app.route('/login', methods=['POST'])
def login():
    input_data = request.get_json()
    dispatcher = RPCDispatcher()
    req = json.dumps({
        'action': RPC_Auth_Action.LOG_IN.name,
        'payload': input_data,
    })
    res = dispatcher.call(AMQP_Auth_Queue, req)
    dispatcher.close()   
    r = Response(res, mimetype='application/json')
    # Login Succeeded.
    res_dict = json.loads(str(res))
    if res_dict['status'] == STATUS_OK:
        r.set_cookie('user-jwt', res_dict['payload']['jwt'])
    return r


@app.route('/logout', methods=['POST'])
def logout():
    jwt = request.cookies.get('user-jwt')
    if jwt:
        r = Response(generate_message(STATUS_OK, SUCCESS_LOGOUT_MESSAGE))
        r.set_cookie('user-jwt', expires=0)
    else:
        r = Response(generate_message(STATUS_ERROR, ERROR_LOGOUT_NOT_YET_LOGIN_MESSAGE))
    return r


@app.route('/verify', methods=['POST'])
def verify():
    input_data = request.get_json()
    dispatcher = RPCDispatcher()
    req = json.dumps({
        'action': RPC_Auth_Action.VALIDATE.name,
        'payload': input_data
    })
    res = dispatcher.call(AMQP_Auth_Queue, req)
    dispatcher.close()
    return Response(res, mimetype='application/json')


@app.route('/additem', methods=['POST'])
def add_item():
    cookie = check_login(request)
    if cookie[0]:
        input_data = request.get_json()
        bf_time = get_cur_time_milli()    
        dispatcher = RPCDispatcher()
        af_time = get_cur_time_milli()
        sys.stderr.write("RPC Creation Takes: %d ms\n" % (af_time - bf_time))
        req = json.dumps({
            'action': RPC_Witter_Action.ADD_TWEET.name,
            'payload': {
                'username': cookie[1],
                'content': input_data['content'],
                #'childType': input_data['childType']
            }
        })
        bf_time = get_cur_time_milli()    
        res = dispatcher.call(AMQP_Tweet_Queue, req)
        af_time = get_cur_time_milli()
        sys.stderr.write("RPC Call Takes: %d ms\n" % (af_time - bf_time))
        dispatcher.close()
        return Response(res, mimetype='application/json')
    else:
        return Response(generate_message(STATUS_ERROR, ERROR_POST_NO_USER))


@app.route('/item/<id>', methods=['GET'])
def get_item(id):
    tweet_id = id
    dispatcher = RPCDispatcher()
    req = json.dumps({
        'action': RPC_Witter_Action.GET_TWEET.name,
        'payload': {
            'id': tweet_id
        }
    })
    res = dispatcher.call(AMQP_Tweet_Queue, req)
    dispatcher.close()
    return Response(res, mimetype='application/json')


@app.route('/item/<id>', methods=['DELETE'])
def delete_item(id):
    tweet_id = id
    dispatcher = RPCDispatcher()
    req = json.dumps({
        'action': RPC_Witter_Action.DELETE_TWEET.name,
        'payload': {
            'id': tweet_id
        }
    })
    res = dispatcher.call(AMQP_Tweet_Queue, req)
    dispatcher.close()    
    res_format = json.loads(res)
    if res_format['status'] == 'OK':
        return Response(res, status=200, mimetype='application/json')
    else:
        return Response(res, status=400, mimetype='application/json')


@app.route('/search', methods=['POST'])
def search():
    cookie = check_login(request)
    input_data = request.get_json()

    following = True
    if 'following' in input_data:
        following = input_data['following']
    input_data['following'] = following

    if (cookie[0] and following) or (not following):
        if(cookie[0] and following):
            input_data['user'] = cookie[1]
        dispatcher = RPCDispatcher()
        req = json.dumps({
            'action': RPC_Witter_Action.SEARCH.name,
            'payload': input_data
        })
        res = dispatcher.call(AMQP_Tweet_Queue, req)
        dispatcher.close()        
        return Response(res, mimetype='application/json')
    else:
        return Response(generate_message(STATUS_ERROR, ERROR_POST_NO_USER))


@app.route('/user/<username>', methods=['GET'])
def get_user(username):
    dispatcher = RPCDispatcher()
    req = json.dumps({
        'action': RPC_Profile_Action.GET_PROFILE.name,
        'payload': {
            'username': username
        }
    })
    res = dispatcher.call(AMQP_Profile_Queue, req)
    dispatcher.close()    
    return Response(res, mimetype='application/json')


@app.route('/user/<username>/followers', methods=['GET'])
def get_follower(username):
    limit = request.args.get('limit')
    dispatcher = RPCDispatcher()
    req = json.dumps({
        'action': RPC_Profile_Action.GET_FOLLOWER.name,
        'payload': {
            'username': username,
            'limit': limit
        }
    })
    res = dispatcher.call(AMQP_Profile_Queue, req)
    dispatcher.close()
    return Response(res, mimetype='application/json')


@app.route('/user/<username>/following', methods=['GET'])
def get_following(username):
    limit = request.args.get('limit')
    dispatcher = RPCDispatcher()
    req = json.dumps({
        'action': RPC_Profile_Action.GET_FOLLOWING.name,
        'payload': {
            'username': username,
            'limit': limit
        }
    })
    res = dispatcher.call(AMQP_Profile_Queue, req)
    dispatcher.close()   
    return Response(res, mimetype='application/json')


@app.route('/follow', methods=['POST'])
def follow():
    cookie = check_login(request)
    if cookie[0]:
        input_data = request.get_json()
        dispatcher = RPCDispatcher()
        follow = True if 'follow' not in input_data else input_data['follow']
        req = json.dumps({
            'action': RPC_Profile_Action.FOLLOW.name,
            'payload': {
                'user': cookie[1],
                'target': input_data['username'],
                'follow': follow
            }
        })
        res = dispatcher.call(AMQP_Profile_Queue, req)
        dispatcher.close()     
        return Response(res, mimetype='application/json')
    else:
        return Response(generate_message(STATUS_ERROR, ERROR_POST_NO_USER))


if __name__ == "__main__":
    # Only for debugging while developing
    app.run(host='0.0.0.0', debug=True, port=80)