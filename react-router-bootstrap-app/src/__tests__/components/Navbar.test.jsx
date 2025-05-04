import Navbar from '../../components/Navbar';
import { renderWithProviders, screen } from '../../testing/test-utils';

test('renders Navbar', () => {
  renderWithProviders(<Navbar />);
});
