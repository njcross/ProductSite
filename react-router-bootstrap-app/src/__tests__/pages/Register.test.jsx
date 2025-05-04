import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../testing/test-utils';
import Register from '../../pages/Register';

describe('Register Page', () => {
  test('renders without crashing', () => {
    renderWithProviders(<Register />);
    expect(screen.getByText).toBeDefined();
  });
});
