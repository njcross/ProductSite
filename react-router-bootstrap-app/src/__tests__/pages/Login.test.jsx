import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../testing/test-utils';
import Login from '../../pages/Login';

describe('Login Page', () => {
  test('renders without crashing', () => {
    renderWithProviders(<Login />);
    expect(screen.getByText).toBeDefined();
  });
});
