# py -m venv venv | python3 -m venv venv - create virtual env
# venv\Scripts\activate | source venv/bin/activate - activate virtual env 
# pip install -r requirements.txt

from flask import Flask, request, jsonify
from sqlalchemy import String, Enum, Text, Integer, select, create_engine, text, Float, or_
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from flask_sqlalchemy import SQLAlchemy
from marshmallow import ValidationError, fields
from flask_marshmallow import Marshmallow
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from flask import session
from functools import wraps
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship

# Initialize Flask app
app = Flask(__name__)
from datetime import timedelta

# Session config for persistence
app.secret_key = 'super-secret-key'  # Already present — keep this
app.permanent_session_lifetime = timedelta(days=7)
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # Or 'None' if using secure + cross-site
app.config['SESSION_COOKIE_SECURE'] = False #set true for production


# MySQL database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:11Oval11@localhost/marvel'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


#Creating our Base Model
class Base(DeclarativeBase):
    pass

# Initialize SQLAlchemy and Marshmallow
db = SQLAlchemy(model_class=Base)
db.init_app(app)
ma = Marshmallow(app)
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

#decorator for checking login status
def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if not session.get('user_id'):
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return wrapper

class CartItem(Base):
    __tablename__ = "cart_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False)
    character_id: Mapped[int] = mapped_column(ForeignKey('characters.id'), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=1)

    user = relationship("User")
    character = relationship("Character")

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    email: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(Enum('admin', 'customer', name="role_enum"), nullable=False)

class Character(Base):
    __tablename__ = "characters"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    alias: Mapped[str] = mapped_column(String(100), nullable=False)
    alignment: Mapped[str] = mapped_column(Enum('hero', 'villain', name="alignment_enum"), nullable=False)
    powers: Mapped[str] = mapped_column(Text, nullable=False)
    image_url: Mapped[str] = mapped_column(String(255), nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
		
	
#Schemas

class CharacterSchema(ma.Schema):
    id = fields.Int(required=False)
    name = fields.String(required=True)
    alias = fields.String(required=True)
    alignment = fields.String(required=True)
    powers = fields.String(required=True)
    image_url = fields.String(required=True)
    price = fields.Float(required=True)

    class Meta:
        fields = ("id", "name", "alias", "alignment", "powers", "image_url", "price")


class UserSchema(ma.Schema):
    id = fields.Int(dump_only=True)
    username = fields.String(required=True)
    email = fields.Email(required=True)
    password = fields.String(required=True, load_only=True)
    role = fields.String(required=True)

    class Meta:
        fields = ("id", "username", "email", "password", "role")


class CartSchema(ma.Schema):
    id = fields.Int(dump_only=True)
    user_id = fields.Int(required=True)
    character_id = fields.Int(required=True)
    quantity = fields.Int(required=True)

    # Optionally include full character details
    character = fields.Nested(CharacterSchema, dump_only=True)

    class Meta:
        fields = ("id", "user_id", "character_id", "quantity", "character")
        
# Initialize Schemas
character_schema = CharacterSchema()
characters_schema = CharacterSchema(many=True) #Can serialize many Trainer objects (a list of them)
user_schema = UserSchema()
users_schema = UserSchema(many=True) #Can serialize many Trainer objects (a list of them)
cart_schema = CartSchema()
carts_schema = CartSchema(many=True) #Can serialize many Trainer objects (a list of them)


def create_database():
    root_engine = create_engine("mysql+mysqlconnector://root:11Oval11@localhost")  # No database specified
    with root_engine.connect() as connection:
        connection.execute(text("CREATE DATABASE IF NOT EXISTS marvel"))


# Without the app context, Flask wouldn't know which app's configuration to use.     
with app.app_context():
    create_database()
    db.create_all() # uses the schema to create the database tables  
    
    
########### Flask Endpoints ##############
# Enable session support
@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({"message": "Logged out"}), 200

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = db.session.execute(select(User).where(User.username == username)).scalar_one_or_none()

    if not user or not check_password_hash(user.password, password):
        return jsonify({"message": "Invalid username or password"}), 401

    session.permanent = True 
    session['user_id'] = user.id

    return jsonify({
        "message": "Login successful",
        "user": {
            "username": user.username,
            "email": user.email,
            "role": user.role
        }
    }), 200

@app.route('/check-login', methods=['GET'])
def check_login():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"loggedIn": False}), 200

    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"loggedIn": False}), 200

    return jsonify({
        "loggedIn": True,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        }
    }), 200
        
@app.route('/register', methods=['POST'])
def register_user():
    try:
        user_data = user_schema.load(request.json)
    except ValidationError as e:
        return jsonify(e.messages), 400

    hashed_password = generate_password_hash(user_data['password'])
    new_user = User(username=user_data['username'], email=user_data['email'], password=hashed_password, role="customer")

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully."}), 201
    
@app.route('/characters', methods=['GET'])
def get_characters():
    sort_by = request.args.get('sortBy', 'name')
    search = request.args.get('search', '')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('perPage', 12))

    valid_sort_fields = {'name', 'alias', 'alignment', 'price'}
    if sort_by not in valid_sort_fields:
        sort_by = 'name'

    query = select(Character)

    if search:
        like_term = f"%{search}%"
        query = query.where(
            or_(
                Character.name.ilike(like_term),
                Character.alias.ilike(like_term),
                Character.alignment.ilike(like_term),
                Character.powers.ilike(like_term)
            )
        )

    query = query.order_by(getattr(Character, sort_by))

    characters = db.session.execute(query).scalars().all()
    start = (page - 1) * per_page
    end = start + per_page
    paginated_characters = characters[start:end]

    return characters_schema.jsonify(paginated_characters), 200


@app.route('/characters/<int:id>', methods=['GET'])
def get_character(id):
    character = db.session.get(Character, id)
    
    return character_schema.jsonify(character), 200


@app.route('/characters', methods=['POST'])
@login_required
def create_character():
    try:
        character_data = character_schema.load(request.json)
    except ValidationError as e:
        return jsonify(e.messages), 400

    new_character = Character(
        name=character_data['name'], 
        alias=character_data['alias'], 
        alignment=character_data['alignment'], 
        powers=character_data['powers'], 
        image_url=character_data['image_url'],
        price=character_data['price']  # <-- Add this
    )

    db.session.add(new_character)
    db.session.commit()

    return character_schema.jsonify(new_character), 201



@app.route('/characters/<int:id>', methods=['PUT'])
@login_required
def update_character(id):
    character = db.session.get(Character, id)
    if not character:
        return jsonify({"message": "Invalid character id"}), 400

    try:
        character_data = character_schema.load(request.json)
    except ValidationError as e:
        return jsonify(e.messages), 400

    character.name = character_data['name']
    character.alias = character_data['alias']
    character.alignment = character_data['alignment']
    character.powers = character_data['powers']
    character.image_url = character_data['image_url']
    character.price = character_data['price']  # <-- Add this

    db.session.commit()

    return character_schema.jsonify(character), 200


@app.route('/characters/<int:id>', methods=['DELETE'])
@login_required
def delete_character(id):
    character = db.session.get(Character, id)

    if not character:
        return jsonify({"message": "Invalid character id"}), 400

    db.session.delete(character)
    db.session.commit()
    
    return jsonify({"message": "Character successfully deleted"}), 200

@app.route('/cart', methods=['GET'])
@login_required
def get_cart():
    user_id = session['user_id']
    items = db.session.query(CartItem).filter_by(user_id=user_id).all()
    return carts_schema.jsonify(items), 200

@app.route('/cart', methods=['POST'])
@login_required
def add_to_cart():
    data = request.json
    user_id = session['user_id']
    character_id = data.get('character_id')
    quantity = data.get('quantity', 1)

    existing_item = db.session.query(CartItem).filter_by(user_id=user_id, character_id=character_id).first()
    if existing_item:
        existing_item.quantity += quantity
    else:
        new_item = CartItem(user_id=user_id, character_id=character_id, quantity=quantity)
        db.session.add(new_item)

    db.session.commit()
    return jsonify({"message": "Item added to cart"}), 201

@app.route('/cart/<int:item_id>', methods=['PUT'])
@login_required
def update_cart_item(item_id):
    user_id = session['user_id']
    data = request.json
    new_quantity = data.get('quantity')

    item = db.session.query(CartItem).filter_by(id=item_id, user_id=user_id).first()
    if not item:
        return jsonify({"message": "Item not found"}), 404

    item.quantity = new_quantity
    db.session.commit()
    return jsonify({"message": "Cart item updated"}), 200

@app.route('/cart/<int:item_id>', methods=['DELETE'])
@login_required
def delete_cart_item(item_id):
    user_id = session['user_id']
    item = db.session.query(CartItem).filter_by(id=item_id, user_id=user_id).first()
    if not item:
        return jsonify({"message": "Item not found"}), 404

    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Cart item deleted"}), 200


app.run(debug=True) # runs flask server