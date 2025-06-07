from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_migrate import Migrate
import redis

db = SQLAlchemy()
ma = Marshmallow()
migrate = Migrate()
redis_client = redis.Redis.from_url("redis://localhost:6379", decode_responses=True)