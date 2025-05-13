import { renderWithProviders } from '../../testing/test-utils';
import { screen } from '@testing-library/react';
import InventorySection from '../../components/InventorySection';

const mockInventory = [
  { id: 1, kit_id: 1, quantity: 10, location: { lat: 0, lng: 0 } },
];

describe('InventorySection', () => {
  test('renders inventory data', () => {
    renderWithProviders(<InventorySection inventory={mockInventory} isAdmin={true} />);
    expect(screen.getByText('Inventory Locations')).toBeInTheDocument();
  });
});
