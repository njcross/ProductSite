import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Home from './pages/Home';
import About from './pages/About';
import Cards from './pages/Cards';
import NotFound from './pages/NotFound';
import EditCharacterPage  from './pages/EditCharacterPage'
import './App.css';
import './Navbar.css';

export default function App() {
  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3 sticky-top">
        <Link className="navbar-brand" to="/">ReactApp</Link>
        <div className="navbar-nav">
          <Link className="nav-link" to="/">Home</Link>
          <Link className="nav-link" to="/cards">Cards</Link>
          <Link className="nav-link" to="/about">About</Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/edit/:id" element={<EditCharacterPage />} />
        <Route path="/cards" element={<Cards />} />
        {/* Catch-all route for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}