import { render, screen, fireEvent } from '@testing-library/react';
import Register from '../pages/Register';
import { BrowserRouter } from 'react-router-dom';

test('renders register form and submits it', () => {
  render(
    <BrowserRouter>
      <Register />
    </BrowserRouter>
  );

  fireEvent.change(screen.getByPlaceholderText(/username/i), {
    target: { value: 'testuser' }
  });
  fireEvent.change(screen.getByPlaceholderText(/email/i), {
    target: { value: 'test@example.com' }
  });
  fireEvent.change(screen.getByPlaceholderText(/password/i), {
    target: { value: 'password123' }
  });

  fireEvent.click(screen.getByText(/register/i));

  // Normally, you'd mock fetch and test that it's called properly.
});
