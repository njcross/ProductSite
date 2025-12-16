
# 🛒 ProductSite

**ProductSite** is a full-stack e-commerce web application designed to provide a seamless shopping experience. Built with modern technologies, it offers features like user authentication, content editing, cart management, and more.

## 🚀 Features

- **User Authentication**: Register and log in using email/password or Google OAuth (SSO via Gmail).
- **Content Editing**: Admins can edit text and images inline; updates sync to content.json and session cache.
- **Content Caching**: content.json is cached in sessionStorage and refreshed only per tab or after content updates.
- **Product Management**: Browse, search, and filter products by categories, rating, and availability.
- **Shopping Cart**: Add, remove, and manage items in your cart with inventory-aware selections.
- **Favorites**: Mark products as favorites and save filter/search preferences.
- **Newsletter Subscription**: Stay updated with the latest products and offers.
- **Google Maps Integration**: Inventory locations displayed via Google Maps with clickable markers.
- **Orders & Reviews**: View past orders/manage ongoing orders or rentals, leave ratings and comments for products with checks to see if review came from verified purchase.
- **Admin Dashboard**: Manage products, categories, users, and reviews.
- **Responsive Design**: Optimized for desktop and mobile using Bootstrap.
- **Session Persistence**: Filter and view preferences stored in sessionStorage for a consistent tab experience.

## 🛠️ Technologies Used

### Frontend

- **React**: JavaScript library for building user interfaces.
- **React Router**: Declarative routing for React applications.
- **Bootstrap**: Responsive design framework.
- **React-Bootstrap**: Bootstrap components built with React.
- **Google Maps JavaScript API**: Location display and interaction.

### Backend

- **Flask**: Lightweight WSGI web application framework.
- **Flask-Login**: User session management for Flask.
- **Flask-Dance**: Google OAuth login.
- **Flask-CORS**: Handling Cross-Origin Resource Sharing (CORS).
- **Flask-Session**: Server-side session extension for Flask.
- **Flask-Migrate**: SQLAlchemy database migrations.
- **Flask-Marshmallow**: Schema and serialization handling.
- **SQLAlchemy**: ORM for database interaction.
- **Marshmallow**: Data validation and serialization.
- **Redis**: In-memory store for sessions.
- **MySQL**: Relational database.

### Deployment & DevOps

- **Docker**: Containerization platform.
- **Docker Compose**: Multi-container orchestration.
- **Gunicorn**: Python WSGI HTTP server.
- **Nginx**: Reverse proxy and static file server.

## 📦 Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/njcross/ProductSite.git
   cd ProductSite
   ```

2. **Set up the backend**:

   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```

   Create a `.env` file:

   ```env
   SECRET_KEY=your-secret-key
   DATABASE_URL=mysql+mysqlconnector://user:pass@localhost/db_name
   REDIS_URL=redis://localhost:6379/0
   GOOGLE_OAUTH_CLIENT_ID=your-client-id
   GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret
   ```

   Run migrations and start server:

   ```bash
   flask db upgrade
   flask run
   ```

3. **Set up the frontend**:

   ```bash
   cd ../frontend
   npm install
   npm start
   ```

## 🧠 Redis (Local Development)

Redis is used for server-side sessions and caching.

### Windows (Recommended): Docker Desktop

Redis does not run natively on Windows in a supported way for most setups. The simplest approach is to run Redis in Docker.

1) **Start Docker Desktop**
- Launch **Docker Desktop** from the Start Menu
- Wait until it shows **“Docker Desktop is running”**
- Make sure Docker is using **Linux containers** (default)

2) **Start Redis**
From PowerShell:

```powershell
docker run -d --name redis-local -p 6379:6379 redis:7
```

### NGINX for React + Flask
Make sure `/etc/nginx/sites-available/productsite.conf` routes static files and proxies `/api/` to Flask. example in backend/nginx/flaskapp.conf

### Symbolic Links (important for NGINX access):
```bash
sudo ln -s /home/ec2-user/ProductSite/react-router-bootstrap-app/public/images /var/www/react/images
sudo ln -s /home/ec2-user/ProductSite/react-router-bootstrap-app/public/content.json /var/www/react/content.json
```

## 🧭 SEO Setup

- Sitemap: auto-generated with `npm run build`
- `robots.txt` and `manifest.json` in `public/`
- Ensure `sitemap.xml` is accessible and referenced in NGINX

## 🐳 Docker Deployment

```bash
docker-compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

## 🌐 Nginx Setup

```bash
sudo cp nginx/productsite.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/productsite.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 📂 Project Structure

```
ProductSite/
├── backend/
├── frontend/
├── docker-compose.yml
└── README.md
```

## 🤝 Contributing

Pull requests and issues welcome!

## 📄 License

MIT License.

## ✉️ Email Integration

- **SMTP Support**: The backend is configured to send emails via SMTP (e.g., for contact forms or notifications). Set your SMTP configuration in `.env`:

  ```env
  MAIL_SERVER=smtp.yourprovider.com
  MAIL_PORT=587
  MAIL_USERNAME=your-email@example.com
  MAIL_PASSWORD=your-password
  MAIL_USE_TLS=True
  MAIL_DEFAULT_SENDER=your-email@example.com
  ```

## ☁️ AWS Deployment from Windows

- **Deploy Script**: A Windows `.bat` script automates deploys to an AWS EC2 instance:
  - Commits changes
  - runs unit tests (FE/BE)
  - Pushes to GitHub
  - SSHs into the EC2 instance
  - Pulls and rebuilds the latest frontend/backend
  - Restarts services
  - Has ability to roll back to last build for the FE
  - can pass vars to only run the backend or the frontend or dry run
  - verifies corresponding (fe/be) tests pass before deploying
  - can force an nginx reload for dns changes
  - can force a Let’s Encrypt renewal and reload Nginx (renew-cert)

  Example usage:

  ```bash
  .\deploy.bat "Deploy message" all reload
  ```
## 🔐 SSL Certificate Renewal (Let's Encrypt)

The deploy script supports on-demand certificate renewal (useful before expiration or after DNS/Nginx changes).

**Renew certificate + reload Nginx:**
```powershell
.\deploy.bat "Deploy + renew cert" all renew-cert
```

## ✅ Testing

- **Frontend**: Uses `Jest` and `React Testing Library` for unit and integration tests.
  - Mocking of APIs and context is handled with `jest.mock()`.
  - Run tests with:

    ```bash
    npm test
    ```

- **Backend**: Uses `pytest` for unit and integration testing.
  - Fixtures and test clients validate endpoints and models.
  - Run tests with:

    ```bash
    pytest
    ```

- Tests are integrated into the deployment process via pre-push checks and optional CI integration.

## 🧠 Dynamic Content Management

- **content.json**: All user-visible text and image URLs are stored in `content.json`.
  - Admins can edit this via `EditableField` and `EditableImage` components.
  - Changes are saved to the backend and cached in `sessionStorage`.
  - Cache is force-refreshed on reload if changes are made.


## 🔄 Real-Time Inventory Management

- **Automatic Updates**: The app includes real-time inventory management where inventory levels adjust dynamically based on:
  - User cart actions
  - Checkout and order fulfillment
  - Admin inventory updates

- **Inventory-Aware Cart**: When users add items to the cart, available quantities are checked and adjusted. Inventory location data is shown to users with Google Maps integration.

- **Admin Tools**: Admins can create, edit, and delete inventory items, including their locations, quantity, and available dates.

- **Location-Aware Checkout**: Users can choose a pickup location from a map or dropdown, and the inventory is deducted accordingly on purchase.


## 🔁 Process Management with PM2

- **PM2** is used in the deployment script to manage both backend and frontend services.
- It supervises the Flask backend process running under **Gunicorn**, ensuring it stays online and is restarted automatically on failure or server reboot.

### Example: Manage Flask Backend with Gunicorn via PM2

```bash
pm2 start "gunicorn 'server:app' --bind 0.0.0.0:5000 --workers 4" --name backend
```

- PM2 is also optionally used to serve the frontend if not using Nginx:

```bash
pm2 start serve --name frontend -- -s build -l 3000
```

### Common PM2 Commands

- View status: `pm2 status`
- Restart a process: `pm2 restart backend`
- Stop a process: `pm2 stop backend`
- View logs: `pm2 logs`
- Enable startup on reboot:

```bash
pm2 startup
pm2 save
```

This setup provides production-grade process management across your entire stack.


- **PM2** can be used to manage the React frontend or other long-running scripts in production.
- While Flask is typically served using **Gunicorn**, PM2 is helpful for:
  - Keeping a static frontend server (e.g. `serve`) running
  - Managing build scripts or node-based tools
  - Ensuring processes restart on crashes

### Example: Serve React Build with PM2

```bash
npm install -g serve pm2
pm2 start serve --name productsite-frontend -- -s build -l 3000
```

### PM2 Commands

- View status: `pm2 status`
- Restart: `pm2 restart productsite-frontend`
- Stop: `pm2 stop productsite-frontend`
- Logs: `pm2 logs`
- Startup config (auto-start on reboot):

```bash
pm2 startup
pm2 save
```

## 📈 SEO Enhancements

- **React Helmet** is used to set page titles and meta tags dynamically for search engine optimization (SEO).


### Sitemap Generation (Automated via Build Script)

- The sitemap is automatically generated as part of the React build process using a custom Node script.
- This is handled via the `package.json` script:

```json
"scripts": {
  "start": "react-scripts start",
  "build": "react-scripts build && node sitemap-generator.js",
  "test": "react-scripts test",
  "eject": "react-scripts eject"
}
```

- The `sitemap-generator.js` script creates a `sitemap.xml` in the `public/` or `build/` directory.


- A sitemap (`public/sitemap.xml`) is automatically generated during deployment to help search engines crawl your site.

### robots.txt

- The `public/robots.txt` file is included in the frontend build to guide search engine crawlers.
  - Example:

    ```
    User-agent: *
    Allow: /
    Sitemap: https://yourdomain.com/sitemap.xml
    ```

### Web App Manifest

- A `manifest.json` file is included in `public/` to enhance the site's metadata and enable PWA features:
  - Describes the app name, icons, theme color, and display mode.
  - Improves discoverability and installability on mobile devices.

### Integration in Deploy Script

- During deployment, the script ensures:
  - `sitemap.xml` is generated or updated.
  - `robots.txt` and `manifest.json` are present in the build folder.
  - Files are properly served by Nginx or any static file server.


## 🔐 Secure User Management

- **Werkzeug Security**: Passwords are securely hashed using Werkzeug's built-in hashing utilities.
  - `generate_password_hash()` is used to store passwords securely.
  - `check_password_hash()` is used during login to verify credentials.
- This ensures that plain text passwords are never stored in the database and that authentication adheres to modern security standards.
