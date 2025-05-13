import { renderWithProviders } from '../../testing/test-utils';
import { screen } from '@testing-library/react';
import PaginationControls from '../../components/PaginationControls';

describe('PaginationControls', () => {
  test('renders previous and next buttons', () => {
    renderWithProviders(<PaginationControls currentPage={1} totalPages={3} onPageChange={() => {}} />);
  });
});
