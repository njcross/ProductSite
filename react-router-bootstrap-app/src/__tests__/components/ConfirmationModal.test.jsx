import { render } from '@testing-library/react';
import ConfirmationModal from './ConfirmationModal';

test('renders ConfirmationModal correctly', () => {
  render(<ConfirmationModal show={false} message="Test message" />);
});
