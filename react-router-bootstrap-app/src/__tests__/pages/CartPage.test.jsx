import React from 'react';
import { render, screen } from '@testing-library/react';
import CartPage from '../pages/CartPage';

describe('CartPage Page', () => {
  test('renders without crashing', () => {
    render(<CartPage />);
    expect(screen.getByText).toBeDefined();
  });
});
