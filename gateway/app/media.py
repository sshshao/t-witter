import uuid
import io
import configparser

from cassandra.cluster import Cluster
from protocols.schema import *

config = configparser.ConfigParser()
config.read('config.ini')
CASS_HOST = config['CASSANDRA']['Cass_Host']
CASS_NAMESPACE = config['CASSANDRA']['Cass_Namespace']

cluster = Cluster([CASS_HOST])


def add_media(content):
    mimetype = content.content_type
    f = open(content, 'rb')
    file_obj = io.BytesIO(f.read())

    session = cluster.connect(CASS_NAMESPACE)
    session.execute(Media_Insert_Query, [generate_media_id(), mimetype, file_obj])
    session.close()
    return None


def get_media(id):
    session = cluster.connect(CASS_NAMESPACE)
    rows = session.execute(Media_Find_Query, [id])
    session.close()

    if len(rows) < 1:
        return None
    else:
        #returns named tuple (id, type, content)
        return rows[0]


def delete_media(ids):
    session = cluster.connect(CASS_NAMESPACE)
    for id in ids:
        rows = session.execute(Media_Delete_Query, [id])
    session.close()


def generate_media_id():
    return uuid.uuid4().hex[:16]