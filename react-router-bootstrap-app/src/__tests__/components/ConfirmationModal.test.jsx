import ConfirmationModal from '../../components/ConfirmationModal';
import { render, screen } from '../../testing/test-utils';

test('renders ConfirmationModal correctly', () => {
  render(<ConfirmationModal show={false} message="Test message" />);
});
