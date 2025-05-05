import { render, screen, fireEvent } from '@testing-library/react';
import Register from '../pages/Register';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from '../context/UserContext';
import { HelmetProvider } from 'react-helmet-async';

test('renders register form and submits it', () => {
  render(
    <HelmetProvider>
      <BrowserRouter>
        <UserProvider>
          <Register />
        </UserProvider>
      </BrowserRouter>
    </HelmetProvider>
  );

  fireEvent.change(screen.getByPlaceholderText(/enter your username/i), { target: { value: 'testuser' } });
  fireEvent.change(screen.getByPlaceholderText(/enter your email/i), { target: { value: 'test@example.com' } });
  fireEvent.change(screen.getByPlaceholderText(/create a password/i), { target: { value: 'password123' } });
  fireEvent.change(screen.getByPlaceholderText(/confirm your password/i), { target: { value: 'password123' } });

  const submitButton = screen.getByTestId('register-submit');
  fireEvent.click(submitButton);

  // You can later assert that the fetch call was made or a redirect occurred
});
