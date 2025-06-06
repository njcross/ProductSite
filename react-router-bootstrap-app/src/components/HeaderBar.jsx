import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import EditableField from '../components/EditableField';
import { removeToken } from '../utils/tokenService';
import './HeaderBar.css';
import styles from '../styles/global.module.css';
import EditableImage from './EditableImage';

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
      alert("Logout Succesful");
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
    <div className={`header-bar ${styles.bgSecondary}`}>
      <Link to="/cards" className={`${styles.largeNavButton} ${styles.mvertSm} ${styles.mhorzMd}`}>
        <EditableImage contentKey="content_img_company" alt="https://dm0qx8t0i9gc9.cloudfront.net/thumbnails/video/rZJIMvhmliwmde8a6/videoblocks-four-kids-play-with-blocks-group-of-children-playing-colorful-constructor-in-playroom-or-nursery-preschool-child-development-center_spxmcgqcn_thumbnail-1080_01.png" className="thumbnail" fieldBelow={<EditableField contentKey="header_logo" />} />
      </Link>

      <form className="search-box" onSubmit={handleSearch}>
        <button type="submit" className={styles.mlMd}>
          <i className="bi bi-search"></i>
        </button>
        <input
          className={styles.mrMd}
          type="text"
          placeholder="Search Play Trays..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>

      <div className="action-group">
        {currentUser ? (
          <>
            <Link to="/cart" className={`${styles.navButton} icon-toggle`}>
  <span className="icon-only"><i className="bi bi-cart"></i></span>
  <span className="text-only"><EditableField contentKey="content_52" /></span>
</Link>
<Link to="/orders" className={`${styles.navButton} icon-toggle`}>
  <span className="icon-only"><i className="bi bi-currency-dollar"></i></span>
  <span className="text-only"><EditableField contentKey="content_225" /></span>
</Link>
            <Link to="/settings" className={`${styles.navButton} icon-toggle`}>
  <span className="icon-only"><i className="bi bi-gear"></i></span>
  <span className="text-only"><EditableField contentKey="content_142" /></span>
</Link>


            <div className="auth-links">
            <button className={`${styles.navButton} icon-toggle`} onClick={handleLogout}>
  <span className="icon-only"><i className="bi bi-box-arrow-right"></i></span>
  <span className="text-only"><EditableField contentKey="content_54" /></span>
</button>
            </div>
          </>
        ) : (
          <div className="auth-links">
            <Link to="/login" className={`${styles.navButton} icon-toggle`}>
              <EditableField contentKey="content_56" />
            </Link>
            
            <Link to="/register" className={`${styles.navButton} icon-toggle`}>
              <EditableField contentKey="content_58" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
