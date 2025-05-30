import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import EditableField from '../components/EditableField';
import { removeToken } from '../utils/tokenService';
import './HeaderBar.css';

export default function HeaderBar() {
  const { currentUser, setCurrentUser } = useUser();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_URL;

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/api/logout`, {
        method: 'POST',
        headers: {
          credentials: 'include',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      removeToken();
      setCurrentUser(null);
      navigate('/');
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
      <div className="logo"><EditableField contentKey="header_logo" /></div>

      <form className="search-box" onSubmit={handleSearch}>
        <label><EditableField contentKey="content_253" /> {/* "Search our trays" */}</label>
        <input
          type="text"
          placeholder="Search Trays..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit">
          <i className="bi bi-search"></i>
        </button>
      </form>

      <div className="action-group">
        {currentUser ? (
          <>
            <Link to="/cart" className="btn cart-btn icon-toggle">
  <span className="icon-only"><i className="bi bi-cart"></i></span>
  <span className="text-only"><EditableField contentKey="content_52" /></span>
</Link>
<Link to="/orders" className="btn cart-btn icon-toggle">
  <span className="icon-only"><i className="bi bi-currency-dollar"></i></span>
  <span className="text-only"><EditableField contentKey="content_225" /></span>
</Link>
            <Link to="/settings" className="btn cart-btn icon-toggle">
  <span className="icon-only"><i className="bi bi-gear"></i></span>
  <span className="text-only"><EditableField contentKey="content_142" /></span>
</Link>


            <div className="auth-links">
            <button className="btn cart-btn icon-toggle" onClick={handleLogout}>
  <span className="icon-only"><i className="bi bi-box-arrow-right"></i></span>
  <span className="text-only"><EditableField contentKey="content_54" /></span>
</button>
            </div>
          </>
        ) : (
          <div className="auth-links">
            <Link to="/login" className="btn cart-btn">
              <EditableField contentKey="content_56" />
            </Link>
            
            <Link to="/register" className="btn cart-btn">
              <EditableField contentKey="content_58" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
