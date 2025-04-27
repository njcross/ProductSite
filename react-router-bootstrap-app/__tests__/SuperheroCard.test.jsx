import { render, screen } from '@testing-library/react';
import SuperheroCard from '../components/SuperheroCard';
import { BrowserRouter } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

test('displays character details', () => {
  const character = {
    id: 1,
    name: 'Iron Man',
    alias: 'Tony Stark',
    powers: 'Powered armor suit',
    image_url: 'http://example.com/ironman.jpg',
    price: 5.0,
  };

  render(
    <BrowserRouter>
      <UserContext.Provider value={{ currentUser: { role: 'customer' } }}>
        <SuperheroCard character={character} />
      </UserContext.Provider>
    </BrowserRouter>
  );

  expect(screen.getByText(/iron man/i)).toBeInTheDocument();
  expect(screen.getByText(/tony stark/i)).toBeInTheDocument();
});
