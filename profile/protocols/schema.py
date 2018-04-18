import json

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