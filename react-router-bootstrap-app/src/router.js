// src/router.js (optional separate file)
import {
    createBrowserRouter,
    RouterProvider,
  } from 'react-router-dom';
  
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
  
  export const router = createBrowserRouter([
    {
      path: '/',
      element: <KitsLandingPage />,
    },
    { path: '/about', element: <About /> },
    { path: '/edit/:id', element: <EditCharacterPage /> },
    { path: '/cards', element: <Cards /> },
    { path: '/register', element: <Register /> },
    { path: '/login', element: <Login /> },
    { path: '/cart', element: <CartPage /> },
    { path: '/settings', element: <UserSettings /> },
    { path: '/favorites', element: <FavoritesPage /> },
    { path: '/newsletter', element: <NewsletterList /> },
    { path: '/orders', element: <Orders /> },
    { path: '*', element: <NotFound /> },
  ], {
    future: {
      v7_relativeSplatPath: true,
    }
  });
  