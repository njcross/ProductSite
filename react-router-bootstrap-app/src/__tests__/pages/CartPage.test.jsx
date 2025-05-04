import React from 'react';
import { render, screen } from '../../testing/test-utils';
import CartPage from '../../pages/CartPage';

describe('CartPage Page', () => {
  test('renders without crashing', () => {
    render(<CartPage />);
    expect(screen.getByText).toBeDefined();
  });
});
