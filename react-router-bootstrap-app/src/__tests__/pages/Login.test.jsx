import React from 'react';
import { render, screen } from '../../testing/test-utils';
import Login from '../../pages/Login';

describe('Login Page', () => {
  test('renders without crashing', () => {
    render(<Login />);
    expect(screen.getByText).toBeDefined();
  });
});
