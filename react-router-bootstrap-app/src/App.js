import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';

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
import KitsLandingPage from './pages/KitsLandingPage';
import UserSettings from './pages/UserSettings';
import { FooterNav } from './components/FooterNav';
import { FooterNewsletter } from './components/FooterNewsletter';

import './App.css';
import './variables.css';

import { UserProvider } from './context/UserContext';
import { CartProvider } from './context/CartContext';
import { ContentContext } from './context/ContentContext';
import { FavoritesProvider } from './context/FavoritesContext';
import FavoritesPage from './pages/FavoritesPage';
import NewsletterList from './pages/NewsLetterList';
import Orders from './pages/Orders';

export default function App() {
  const [content, setContent] = useState({});

  useEffect(() => {
    fetch('/content.json', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => setContent(data))
      .catch(err => console.error('Failed to load content.json', err));
  }, []);

  return (
    <UserProvider>
    <FavoritesProvider>
      <CartProvider>
        <ContentContext.Provider value={{ content, setContent }}>
          <Router>
            <div className="app-container">
              <HeaderBar />
              <Navbar />
              <Routes>
                <Route path="/" element={<KitsLandingPage />} />
                <Route path="/about" element={<About />} />
                <Route path="/edit/:id" element={<EditCharacterPage />} />
                <Route path="/cards" element={<Cards />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/cart" element={<CartPage />} />
                {/* <Route path="/test" element={<Home />} /> */}
                <Route path="/settings" element={<UserSettings />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/newsletter" element={<NewsletterList />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <FooterNewsletter />
              <FooterNav />
            </div>
          </Router>
        </ContentContext.Provider>
      </CartProvider>
      </FavoritesProvider>
    </UserProvider>
    
  );
}
