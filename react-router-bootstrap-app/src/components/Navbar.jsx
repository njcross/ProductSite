// src/components/Navbar.jsx
import { useState } from 'react';


import EditableField from '../components/EditableField';import { Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [expanded, setExpanded] = useState(false);

  const toggleNavbar = () => setExpanded(!expanded);
  const closeNavbar = () => setExpanded(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light px-3 custom-navbar">
      <div className="container-fluid navbar-container">
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleNavbar}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${expanded ? 'show' : ''}`}>
          <div className="navbar-nav me-auto">
            <Link className="nav-link" to="/" onClick={closeNavbar}>{<EditableField contentKey="content_66" />}</Link>
            <Link className="nav-link" to="/cards" onClick={closeNavbar}>{<EditableField contentKey="content_67" />}</Link>
            <Link className="nav-link" to="/about" onClick={closeNavbar}>{<EditableField contentKey="content_68" />}</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
