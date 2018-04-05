
JWT_Schema = {
    'uid': {'type': 'integer'},
    'duration': {'type': 'integer'},
    'time_created': {'type': 'integer'},
}

Login_Schema = {
    'username': {'type': 'string'},
    'password': {'type': 'string'},
}

Register_Schema = {
    'email': {'type': 'string'},
    'username': {'type': 'string'},
    'password': {'type': 'string'},
}

Validation_Schema = {
    'email': {'type': 'string'},
    'key': {'type': 'string'}
}

Auth_Schema = {
    'action': {'type': 'string'},
    'payload': {'type': 'dict'},
}

Email_Schema = {
    'email': {'type': 'string'},
    'title': {'type': 'string'},
    'content': {'type': 'string'},
}

Validate_JWT_Schema = {
    'jwt': {'type': 'string'},
}