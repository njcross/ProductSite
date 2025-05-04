import CharacterCarousel from '../../components/CharacterCarousel';
import { renderWithProviders, screen } from '../../testing/test-utils';

test('renders CharacterCarousel without crashing', () => {
  renderWithProviders(<CharacterCarousel filter={[1]} />);
});
