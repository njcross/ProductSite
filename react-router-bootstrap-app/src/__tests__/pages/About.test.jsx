import React from 'react';
import { render, screen } from '@testing-library/react';
import About from '../pages/About';

describe('About Page', () => {
  test('renders without crashing', () => {
    render(<About />);
    expect(screen.getByText).toBeDefined();
  });
});
