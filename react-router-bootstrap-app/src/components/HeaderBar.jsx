// src/components/HeaderBar.jsx
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './HeaderBar.css';

export default function HeaderBar() {
  const { currentUser, setCurrentUser } = useUser();
  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setCurrentUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div className="header-bar">
      <div className="logo">🛍️ AllyShop</div>

      <div className="search-box">
        <input type="text" placeholder="Search characters..." />
        <button>
          <i className="bi bi-search"></i>
        </button>
      </div>
      {(currentUser) && (
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
  );
}
