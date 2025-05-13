import { renderWithProviders } from '../../testing/test-utils';
import { screen } from '@testing-library/react';
import DividerWithText from '../../components/DividerWithText';

describe('DividerWithText', () => {
  test('renders text in divider', () => {
    renderWithProviders(<DividerWithText text="OR" />);
    expect(screen.getByText('OR')).toBeInTheDocument();
  });
});
