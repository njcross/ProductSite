import ConfirmationModal from '../../components/ConfirmationModal';
import { renderWithProviders, screen } from '../../testing/test-utils';

test('renders ConfirmationModal correctly', () => {
  renderWithProviders(<ConfirmationModal show={false} message="Test message" />);
});
