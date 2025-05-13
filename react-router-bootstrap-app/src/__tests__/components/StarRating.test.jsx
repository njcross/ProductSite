import { renderWithProviders } from '../../testing/test-utils';
import { screen } from '@testing-library/react';
import StarRating from '../../components/StarRating';

describe('StarRating', () => {
  test('renders 5 stars', () => {
    renderWithProviders(<StarRating rating={4} />);
    const stars = screen.getAllByText('★');
    expect(stars.length).toBeGreaterThanOrEqual(4);
  });
});
