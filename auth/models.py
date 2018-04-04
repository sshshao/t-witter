from sqlalchemy import create_engine, MetaData
from sqlalchemy import Table, Column, Integer, String, ForeignKey, Boolean, DateTime, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy_utils import database_exists, create_database
import configparser

Base = declarative_base()


class UserAccount(Base):
    __tablename__ = 'userAccount'
    uid = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(64), unique=True)
    email = Column(String(64), unique=True)
    password = Column(String(128), nullable=False)
    password_salt = Column(String(128), nullable=False)
    activated = Column(Boolean, default=False)
    registered_date = Column(DateTime, default=func.now(), nullable=False)
    last_login_date = Column(DateTime, default=None)


class UserActivationToken(Base):
    __tablename__ = 'userActivationToken'
    tokenid = Column(Integer, primary_key=True, autoincrement=True)    
    uid = Column(Integer, ForeignKey('userAccount.uid'), nullable=False)
    activation_token = Column(String(128), nullable=False)
    user_account = relationship(UserAccount)



def connect():
    # Read from the configuration file.
    config = configparser.ConfigParser()
    config.read('config.ini')
    config_auth = config['AUTH']

    user = config_auth['PostgreSQL_User']
    password = config_auth['PostgreSQL_Password']
    host = config_auth['PostgreSQL_Host']
    db = config_auth['PostgreSQL_DBName']

    postgre_db_addr = "postgresql://%s:%s@%s:5432/%s" % (user, password, host, db)

    engine = create_engine(postgre_db_addr, client_encoding='utf8')

    return engine


engine = connect()

if not database_exists(engine.url):
    create_database(engine.url) 
    
Base.metadata.create_all(engine)



