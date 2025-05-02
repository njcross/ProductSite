import React from 'react';
import { render, screen } from '@testing-library/react';
import Orders from '../pages/Orders';

describe('Orders Page', () => {
  test('renders without crashing', () => {
    render(<Orders />);
    expect(screen.getByText).toBeDefined();
  });
});
