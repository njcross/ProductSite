import { render, screen, fireEvent } from '@testing-library/react';
import HeaderBar from '../components/HeaderBar';
import { BrowserRouter } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const renderHeader = (user = null) => {
  return render(
    <BrowserRouter>
      <UserContext.Provider value={{ currentUser: user, setCurrentUser: jest.fn() }}>
        <HeaderBar />
      </UserContext.Provider>
    </BrowserRouter>
  );
};

test('renders search bar and login/register when logged out', () => {
  renderHeader();
  expect(screen.getByPlaceholderText(/search characters/i)).toBeInTheDocument();
  expect(screen.getByText(/login/i)).toBeInTheDocument();
  expect(screen.getByText(/register/i)).toBeInTheDocument();
});

test('shows logout and cart when logged in', () => {
  renderHeader({ username: 'testuser', role: 'customer' });
  expect(screen.getByText(/logout/i)).toBeInTheDocument();
  expect(screen.getByText(/cart/i)).toBeInTheDocument();
});
