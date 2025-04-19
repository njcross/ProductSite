
import { Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3 custom-navbar">
      <div className="navbar-brand logo-text">AllyShop</div>
      <div className="navbar-nav ms-auto">
        <Link className="nav-link" to="/">Home</Link>
        <Link className="nav-link" to="/cards">Cards</Link>
        <Link className="nav-link" to="/about">About</Link>
      </div>
    </nav>
  );
}