# MyPlayTray Frontend

A fully responsive React-based frontend for MyPlayTray, a Marvel-inspired character and kit exploration app. This app allows users to browse kits, save favorites, write reviews, rate items, manage a shopping cart, and checkout. Admins can edit content dynamically and manage the character database.

## 🚀 Features

- **Kit Exploration**: Filter, search, sort, and paginate through kits.
- **User Authentication**: Register, login, Google OAuth, and secure session handling.
- **Cart Management**: Add/remove kits, adjust quantities, and checkout.
- **Ratings & Reviews**: Leave comments and star ratings per kit.
- **Favorites**: Save kits or searches for easy return visits.
- **Editable Content**: Admins can edit site text/images via JSON content keys.
- **Newsletter & Contact**: Footer subscription form + contact form with EmailJS.
- **Order History**: Users can view previous purchases.
- **Admin Tools**: Edit characters/kits, dynamic content management, access all purchases.

## 💠 Tech Stack

- **React**
- **React Router v6**
- **React Bootstrap + Bootstrap 5**
- **React Helmet** (for SEO)
- **EmailJS** (for contact form)
- **Context API** (for user, cart, content, and favorites state)

## 📁 Directory Structure

```
src/
├── components/          # Reusable UI components (e.g., Cards, Modals, Filters)
├── context/             # React context for global state management
├── pages/               # Page-level React views (Cards, About, KitsLandingPage, etc.)
├── utils/               # Helper functions (e.g., tokenService.js)
├── App.jsx              # Main Router with Routes
├── variables.css        # CSS variables for consistent theming
└── App.css              # Global styles
```

## 🧪 Testing

Unit tests use **Jest** + **React Testing Library**.

### Run frontend tests:

```bash
npm install
npm test
```

To run once:

```bash
npm test -- --watchAll=false
```

Test files are in `src/__tests__/` or next to components.

## 🌐 SEO

- Meta tags handled with `react-helmet`
- Sitemap auto-generated on build (via `react-router-sitemap`)
- robots.txt in `public/robots.txt`

## 📦 Deployment

1. Build the app:

```bash
npm run build
```

2. Deploy via NGINX or your preferred host. Ensure `index.html` fallback is configured.

## 🌍 Sitemap

Ensure `public/sitemap.xml` exists and add this to your `nginx` config:

```nginx
location = /sitemap.xml {
    root /var/www/react;
}
```

## ✅ Environment Variables

Place your variables in `.env`:

```
REACT_APP_API_URL=https://your-backend.com
REACT_APP_EMAILJS_USER_ID=xxxxxx
```

## 🧑‍💻 Development Setup

1. Clone the repo:

```bash
git clone https://github.com/njcross/ProductSite.git
cd ProductSite/react-router-bootstrap-app
```

2. Install deps and start:

```bash
npm install
npm start
```

Frontend runs on `http://localhost:3000`. The backend must run on a compatible domain (e.g., `http://localhost:5000`).

## 📜 License

MIT

## 🙌 Credits

- [React](https://reactjs.org/)
- [Bootstrap](https://getbootstrap.com/)
- [React-Bootstrap](https://react-bootstrap.github.io/)
- [Marvel](https://www.marvel.com/) for thematic inspiration