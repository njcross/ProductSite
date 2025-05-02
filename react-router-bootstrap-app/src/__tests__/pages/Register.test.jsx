import React from 'react';
import { render, screen } from '@testing-library/react';
import Register from '../pages/Register';

describe('Register Page', () => {
  test('renders without crashing', () => {
    render(<Register />);
    expect(screen.getByText).toBeDefined();
  });
});
