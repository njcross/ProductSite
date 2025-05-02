import { render } from '@testing-library/react';
import SuperheroCard from './SuperheroCard';

test('renders SuperheroCard with props', () => {
  const character = { id: 1, name: 'Spider-Man', image_url: '', price: 20 };
  render(<SuperheroCard character={character} />);
});
