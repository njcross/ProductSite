import { render, screen, fireEvent } from '@testing-library/react';
import Login from '../pages/Login';
import { BrowserRouter } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

test('renders login form', () => {
  render(
    <BrowserRouter>
      <UserContext.Provider value={{ setCurrentUser: jest.fn() }}>
        <Login />
      </UserContext.Provider>
    </BrowserRouter>
  );

  expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
});
