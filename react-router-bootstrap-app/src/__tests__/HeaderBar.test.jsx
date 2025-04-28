import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from '../context/UserContext'; // not UserContext.Provider manually
import HeaderBar from '../components/HeaderBar';

test('renders search bar and login/register when logged out', () => {
  render(
    <BrowserRouter>
      <UserProvider>
        <HeaderBar />
      </UserProvider>
    </BrowserRouter>
  );

  expect(screen.getByPlaceholderText(/search characters/i)).toBeInTheDocument();
});
