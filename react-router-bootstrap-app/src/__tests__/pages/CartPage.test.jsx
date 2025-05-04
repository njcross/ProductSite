import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../testing/test-utils';
import CartPage from '../../pages/CartPage';

describe('CartPage Page', () => {
  test('renders without crashing', () => {
    renderWithProviders(<CartPage />);
    expect(screen.getByText).toBeDefined();
  });
});
