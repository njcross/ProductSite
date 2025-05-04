import { FooterNav } from '../../components/FooterNav';
import { renderWithProviders, screen } from '../../testing/test-utils';

test('renders FooterNav', () => {
  renderWithProviders(<FooterNav />);
});
