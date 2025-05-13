import { renderWithProviders, screen } from '../../testing/test-utils';
import HeroCarousel from '../../components/HeroCarousel';

describe('HeroCarousel', () => {
  test('renders without error', () => {
    renderWithProviders(<HeroCarousel />);
  });
});
