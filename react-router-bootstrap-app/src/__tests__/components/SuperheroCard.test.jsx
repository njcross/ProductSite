import SuperheroCard from '../../components/SuperheroCard';
import { renderWithProviders, screen } from '../../testing/test-utils';

test('renders SuperheroCard with props', () => {
  const character = { id: 1, name: 'Spider-Man', image_url: '', price: 20 };
  renderWithProviders(<SuperheroCard character={character} />);
});
