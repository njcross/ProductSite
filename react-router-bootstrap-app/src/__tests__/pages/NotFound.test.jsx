import React from 'react';
import { render, screen } from '@testing-library/react';
import NotFound from '../pages/NotFound';

describe('NotFound Page', () => {
  test('renders without crashing', () => {
    render(<NotFound />);
    expect(screen.getByText).toBeDefined();
  });
});
