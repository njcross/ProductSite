import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Cards from './pages/Cards';
import NotFound from './pages/NotFound';
import EditCharacterPage from './pages/EditCharacterPage';
import Navbar from './components/Navbar';
import HeaderBar from './components/HeaderBar';
import './App.css';
import './Navbar.css';

export default function App() {
  return (
    <Router>
      <HeaderBar />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/edit/:id" element={<EditCharacterPage />} />
        <Route path="/cards" element={<Cards />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
