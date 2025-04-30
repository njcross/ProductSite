import { render, screen, fireEvent } from '@testing-library/react';
import Login from '../pages/Login';
import { BrowserRouter } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { UserProvider } from '../context/UserContext';

test('renders login form', () => {
  render(
    <BrowserRouter>
      <UserProvider>
  <Login />
</UserProvider>
    </BrowserRouter>
  );

  expect(screen.getByPlaceholderText(/enter your username/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
});
