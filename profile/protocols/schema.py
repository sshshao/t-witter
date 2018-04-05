import json

db_model = json.dumps({
    'id': 'ixo134j03k4l3',
    'username': 'mazafaka',
    'email': 'mazafaka@email.com',
    'following': ['ruozhi', 'shabi', 'jiba'],
    'follower': ['jiba']
})

def new_profile(id, username, email):
    return json.dumps({
        'id': id,
        'username': username,
        'email': email,
        'follower': [],
        'following': []
    })


def query_profile(username):
    return json.dumps({
        'username': username
    })