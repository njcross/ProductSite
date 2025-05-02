import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../pages/Home';

describe('Home Page', () => {
  test('renders without crashing', () => {
    render(<Home />);
    expect(screen.getByText).toBeDefined();
  });
});
