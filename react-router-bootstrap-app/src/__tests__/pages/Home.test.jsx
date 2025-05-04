import React from 'react';
import { render, screen } from '../../testing/test-utils';
import Home from '../../pages/Home';

describe('Home Page', () => {
  test('renders without crashing', () => {
    render(<Home />);
    expect(screen.getByText).toBeDefined();
  });
});
