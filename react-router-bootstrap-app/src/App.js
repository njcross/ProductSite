import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Cards from './pages/Cards';
import NotFound from './pages/NotFound';
import EditCharacterPage from './pages/EditCharacterPage';
import Register from './pages/Register';
import Navbar from './components/Navbar';
import HeaderBar from './components/HeaderBar';
import Login from './pages/Login';
import CartPage from './pages/CartPage';
import './App.css';
import './Navbar.css';
import './variables.css';
import { UserProvider } from './context/UserContext';
import { CartProvider } from './context/CartContext';

export default function App() {
  
  return (
    <UserProvider>
      <CartProvider>
      <Router>
      <div className="app-container">
        <HeaderBar />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/edit/:id" element={<EditCharacterPage />} />
          <Route path="/cards" element={<Cards />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </div>
      </Router>
      </CartProvider>
    </UserProvider>
  );
}
