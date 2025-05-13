import { render } from '@testing-library/react';
import InventoryMap from '../../components/InventoryMap';

describe('InventoryMap', () => {
  test('renders map container', () => {
    const { container } = render(<InventoryMap locations={[]} />);
    expect(container).toBeInTheDocument();
  });
});
