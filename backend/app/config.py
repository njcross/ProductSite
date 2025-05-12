import os
from dotenv import load_dotenv
import redis
load_dotenv()

class Config:
    SECRET_KEY = os.getenv('FLASK_SECRET_KEY')
    SESSION_TYPE = 'redis'
    SESSION_PERMANENT = False
    SESSION_USE_SIGNER = True
    SESSION_KEY_PREFIX = 'session:'
    SESSION_REDIS = redis.StrictRedis(host='localhost', port=6379, db=0)
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    ROOT_DATABASE_URL = os.getenv('ROOT_DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_ORIGIN = [os.getenv('CORS_ORIGIN1'), os.getenv('CORS_ORIGIN2')]
    GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
    OAUTHLIB_INSECURE_TRANSPORT = True  # Only for local dev
