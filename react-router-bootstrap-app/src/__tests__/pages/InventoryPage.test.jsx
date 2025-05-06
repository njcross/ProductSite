import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../testing/test-utils';
import InventoryPage from '../../pages/InventoryPage';

describe('InventoryPage Page', () => {
  test('renders without crashing', () => {
    renderWithProviders(<InventoryPage />);
    expect(screen.getByText).toBeDefined();
  });
});
