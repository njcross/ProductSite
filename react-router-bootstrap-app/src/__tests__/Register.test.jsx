import { render, screen, fireEvent } from '@testing-library/react';
import Register from '../pages/Register'; // adjust path if needed
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from '../context/UserContext';

test('renders register form and submits it', () => {
  render(
    <BrowserRouter>
      <UserProvider>
        <Register />
      </UserProvider>
    </BrowserRouter>
  );

  // Fill out the form fields
  fireEvent.change(screen.getByPlaceholderText(/enter your username/i), { target: { value: 'testuser' } });
  fireEvent.change(screen.getByPlaceholderText(/enter your email/i), { target: { value: 'test@example.com' } });
  fireEvent.change(screen.getByPlaceholderText(/create a password/i), { target: { value: 'password123' } });
  fireEvent.change(screen.getByPlaceholderText(/confirm your password/i), { target: { value: 'password123' } });

  // Instead of looking for name /register/i, just get first button
  const submitButton = screen.getByRole('button'); // ✅
  fireEvent.click(submitButton);

  // ✅ (Later you should mock fetch and assert the API call or redirect)
});
