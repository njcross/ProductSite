import os
from dotenv import load_dotenv
load_dotenv()

class Config:
    SECRET_KEY = os.getenv('FLASK_SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    ROOT_DATABASE_URL = os.getenv('ROOT_DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_ORIGIN = [os.getenv('CORS_ORIGIN1'), os.getenv('CORS_ORIGIN2')]
    GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
    OAUTHLIB_INSECURE_TRANSPORT = True  # Only for local dev
