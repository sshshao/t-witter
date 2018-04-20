import uuid
import sys
import configparser

from cassandra.cluster import Cluster
from protocols.schema import *

config = configparser.ConfigParser()
config.read('config.ini')
CASS_HOST = config['CASSANDRA']['Cass_Host']
CASS_NAMESPACE = config['CASSANDRA']['Cass_Namespace']

cluster = Cluster([CASS_HOST])

session = cluster.connect()
session.execute(
    """
    CREATE KEYSPACE IF NOT EXISTS %s
    WITH replication = { 'class': 'SimpleStrategy', 'replication_factor': '1'}
    """ % CASS_NAMESPACE
)

session.set_keyspace(CASS_NAMESPACE)

session.execute(
    """
    CREATE TABLE IF NOT EXISTS media (
        id text,
        type text,
        content blob,
        PRIMARY KEY (id)
    )   
    """
)

def add_media(content):
    mimetype = content.content_type
    file_obj = content.read()
#    sys.stderr.write(file_obj)
    media_id = generate_media_id()

#    session = cluster.connect(CASS_NAMESPACE)
    session.execute_async(Media_Insert_Query, [media_id, mimetype, file_obj])
#    session.close()
    return media_id

def get_media(id):
#    session = cluster.connect(CASS_NAMESPACE)
    rows = session.execute(Media_Find_Query, [id])
#    session.close()

    data = list(rows)

    if len(data) < 1:
        return None
    else:
        #returns named tuple (id, type, content)
        return data[0]


def delete_media(ids):
#    session = cluster.connect(CASS_NAMESPACE)
    for id in ids:
        rows = session.execute(Media_Delete_Query, [id])
#    session.close()


def generate_media_id():
    return uuid.uuid4().hex[:16]