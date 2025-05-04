import { FooterNewsletter } from '../../components/FooterNewsletter';
import { renderWithProviders, screen } from '../../testing/test-utils';

test('renders FooterNewsletter', () => {
  renderWithProviders(<FooterNewsletter />);
});
