import { createBrowserRouter, Outlet } from 'react-router-dom';
import HeaderBar from './components/HeaderBar';
import Navbar from './components/Navbar';
import { FooterNav } from './components/FooterNav';
import { FooterNewsletter } from './components/FooterNewsletter';
import './App.css';

import Home from './pages/Home';
  import About from './pages/About';
  import Cards from './pages/Cards';
  import NotFound from './pages/NotFound';
  import EditCharacterPage from './pages/EditCharacterPage';
  import Register from './pages/Register';
  import Login from './pages/Login';
  import CartPage from './pages/CartPage';
  import KitsLandingPage from './pages/KitsLandingPage';
  import UserSettings from './pages/UserSettings';
  import FavoritesPage from './pages/FavoritesPage';
  import NewsletterList from './pages/NewsLetterList';
  import Orders from './pages/Orders';
  import InventoryPage from '../pages/InventoryPage';

const Layout = () => (
  <div className="app-container">
    <HeaderBar />
    <Navbar />
    <Outlet />
    <FooterNewsletter />
    <FooterNav />
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <KitsLandingPage /> },
      { path: 'about', element: <About /> },
      { path: 'cards', element: <Cards /> },
      { path: 'edit/:id', element: <EditCharacterPage /> },
      { path: 'register', element: <Register /> },
      { path: 'login', element: <Login /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'settings', element: <UserSettings /> },
      { path: 'favorites', element: <FavoritesPage /> },
      { path: 'newsletter', element: <NewsletterList /> },
      { path: 'orders', element: <Orders /> },
      { path: 'inventory', element: <InventoryPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
], {
  future: {
    v7_relativeSplatPath: true,
    v7_startTransition: true,
  }
});
