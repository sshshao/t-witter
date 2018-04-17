import json
import uuid


def generate_media_id():
    return uuid.uuid4().hex[:16]