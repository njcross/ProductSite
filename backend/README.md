# 🛠️ Backend - ProductSite API

This is the **Flask-based backend** for the full-stack Marvel-themed product site, providing RESTful APIs for managing kits (characters), authentication, shopping cart, user settings, reviews, purchases, favorites, content editing, and newsletter subscriptions.

---

## 🚀 Features

* 🔐 **Authentication & Authorization**

  * Register/Login with username/password or Google OAuth (via Flask-Dance)
  * Role-based access control: `admin` vs `customer`

* 🎮 **Kit Management (Admin)**

  * Create, update, delete kits (products)
  * Support for age ranges, categories, pricing, image URL, description

* 📦 **Cart System**

  * Add/update/delete kits from shopping cart
  * Persisted by user session

* 🛒 **Purchases**

  * Checkout and store purchase history
  * Tracks quantity and timestamp

* ❤️ **Favorites & Saved Searches**

  * Save kits to favorites
  * Save filter parameters for future browsing

* ✨ **Reviews & Ratings**

  * Submit star ratings and comments per kit
  * Aggregate average ratings and review count

* 📝 **Editable Content**

  * Editable text and image content managed via `content.json`
  * Admins can update content live from frontend

* 📧 **Newsletter Subscription**

  * Email subscriptions stored via simple endpoint

* ⚙️ **User Settings**

  * Update email or password securely

* 🔒 **Secure Sessions & CORS**

  * Session-based login with support for cross-origin credentials

---

## 📂 Project Structure

```
backend/
├── app/
│   ├── models/           # SQLAlchemy models
│   ├── routes/           # Blueprint route modules
│   ├── schemas/          # Marshmallow schemas
│   ├── utils/            # Decorators and helper functions
│   ├── __init__.py       # create_app() factory
│
├── tests/                # Pytest test suite
├── migrations/           # Alembic migrations
├── content.json          # Editable frontend content
├── config.py             # Configs (dev/prod)
├── requirements.txt      # Python dependencies
└── wsgi.py               # Entry point for deployment
```

---

## ⚙️ Environment Setup

### Prerequisites

* Python 3.9+
* MySQL (or MariaDB)

### Install Dependencies

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Set Environment Variables

Create a `.env` file:

```
FLASK_APP=wsgi.py
FLASK_ENV=development
DATABASE_URL=mysql+mysqlconnector://user:password@localhost/marvel
SECRET_KEY=your-secret
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

---

## 🧪 Running Tests

```bash
# activate your virtual environment
source venv/bin/activate

# run all tests
pytest

# run tests with coverage
pytest --cov=app
```

Test files are located in the `tests/` folder. Fixtures and mocks can be found in `tests/conftest.py`.

---

## 🔄 Migrations (Alembic)

```bash
flask db init             # run once
flask db migrate -m "Initial"
flask db upgrade
```

Use `flask db downgrade` to roll back.

---

## 🚀 Deployment Notes

Ensure `wsgi.py` exposes your app:

```python
from app import create_app
app = create_app()
```

Set up WSGI server (e.g. Gunicorn) and reverse proxy (e.g. NGINX).

---

## 🔐 OAuth Notes

* `/api/login/google` — begins login flow
* `/api/login/google/authorized` — callback endpoint

On success, user is stored in session. If not in DB, a new user is created.

---

## 📬 API Endpoints Overview

| Feature      | Method | Endpoint                      |
| ------------ | ------ | ----------------------------- |
| Auth         | POST   | `/api/login`, `/api/register` |
| OAuth        | GET    | `/api/login/google`           |
| Kits         | GET    | `/api/kits`                   |
|              | POST   | `/api/kits` (admin only)      |
|              | PUT    | `/api/kits/<id>` (admin only) |
|              | DELETE | `/api/kits/<id>` (admin only) |
| Cart         | GET    | `/api/cart`                   |
|              | POST   | `/api/cart`                   |
|              | PUT    | `/api/cart/<id>`              |
|              | DELETE | `/api/cart/<id>`              |
|              | DELETE | `/api/cart/all`               |
| Purchases    | POST   | `/api/purchases`              |
|              | GET    | `/api/purchases`              |
| Content      | GET    | `/api/content`                |
|              | PUT    | `/api/content` (admin only)   |
| Reviews      | POST   | `/api/reviews/<kit_id>`       |
|              | DELETE | `/api/reviews/<kit_id>`       |
| Favorites    | GET    | `/api/favorites`              |
|              | POST   | `/api/favorites`              |
|              | DELETE | `/api/favorites/<kit_id>`     |
| SavedSearch  | GET    | `/api/saved-searches`         |
| Newsletter   | POST   | `/api/newsletter`             |
| UserSettings | PUT    | `/api/settings/email`         |
|              | PUT    | `/api/settings/password`      |

---

## 📜 License

This project is licensed under the [MIT License](../LICENSE).

## 🙏 Acknowledgments

* [Flask](https://flask.palletsprojects.com/)
* [SQLAlchemy](https://www.sqlalchemy.org/)
* [Flask-Dance](https://flask-dance.readthedocs.io/) for OAuth
* [Marshmallow](https://marshmallow.readthedocs.io/) for serialization
* [MySQL](https://www.mysql.com/) as database backend

---

> Built with ❤️ by Nicholas Cross
