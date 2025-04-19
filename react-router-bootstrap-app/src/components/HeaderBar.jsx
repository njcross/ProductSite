// src/components/HeaderBar.jsx
import './HeaderBar.css';

export default function HeaderBar() {
  return (
    <div className="header-bar">
      <div className="logo">🛍️ AllyShop</div>

      <div className="search-box">
        <input type="text" placeholder="Search characters..." />
        <button>
          <i className="bi bi-search"></i>
        </button>
      </div>

      <div className="auth-buttons">
        <button className="btn login">Login</button>
        <button className="btn register">Register</button>
      </div>
    </div>
  );
}
