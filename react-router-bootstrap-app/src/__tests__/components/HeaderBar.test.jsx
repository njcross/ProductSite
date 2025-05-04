import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../testing/test-utils';
import HeaderBar from '../../components/HeaderBar';

test('renders Search characters input', () => {
  renderWithProviders(<HeaderBar />);
  expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
});
