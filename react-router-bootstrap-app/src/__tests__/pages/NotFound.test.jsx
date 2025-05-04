import React from 'react';
import { render, screen } from '../../testing/test-utils';
import NotFound from '../../pages/NotFound';

describe('NotFound Page', () => {
  test('renders without crashing', () => {
    render(<NotFound />);
    expect(screen.getByText).toBeDefined();
  });
});
