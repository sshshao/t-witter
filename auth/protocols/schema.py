
JWT_Schema = {
    'uid': {'required': True,'type': 'integer'},
    'duration': {'required': True,'type': 'integer'},
    'time_created': {'required': True,'type': 'integer'},
}

Login_Schema = {
    'username': {'required': True, 'type': 'string'},
    'password': {'required': True, 'type': 'string'},
}

Register_Schema = {
    'email': {'required': True, 'type': 'string'},
    'username': {'required': True, 'type': 'string'},
    'password': {'required': True, 'type': 'string'},
}

Validation_Schema = {
    'email': {'required': True, 'type': 'string'},
    'key': {'required': True, 'type': 'string'},
}

Auth_Schema = {
    'action': {'required': True, 'type': 'string'},
    'payload': {'required': True, 'type': 'dict'},
}

Email_Schema = {
    'email': {'required': True, 'type': 'string'},
    'title': {'required': True, 'type': 'string'},
    'content': {'required': True, 'type': 'string'},
}

Validate_JWT_Schema = {
    'jwt': {'required': True, 'type': 'string'},
}