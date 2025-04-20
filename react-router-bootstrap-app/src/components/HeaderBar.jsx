import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './HeaderBar.css';

export default function HeaderBar() {
  const { currentUser, setCurrentUser } = useUser();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_URL;

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: 'POST',
        headers: { 'ngrok-skip-browser-warning': 'true', credentials: 'include', 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      setCurrentUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/cards?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  return (
    <div className="header-bar">
      <div className="logo">🛍️ AllyShop</div>

      <form className="search-box" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search characters..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit">
          <i className="bi bi-search"></i>
        </button>
      </form>
      <div className="action-group">
      {currentUser && (
        <Link to="/cart" className="btn cart-btn">🛒 Cart</Link>
      )}

      <div className="auth-links">
        {currentUser ? (
          <button className="auth-btn" onClick={handleLogout}>Logout</button>
        ) : (
          <Link to="/login" className="auth-btn">Login</Link>
        )}
        <Link to="/register" className="auth-btn">Register</Link>
      </div>
      </div>
    </div>
  );
}
