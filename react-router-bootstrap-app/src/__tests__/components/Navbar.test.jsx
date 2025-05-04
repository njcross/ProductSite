import Navbar from '../../components/Navbar';
import { render, screen } from '../../testing/test-utils';

test('renders Navbar', () => {
  render(<Navbar />);
});
