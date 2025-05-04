import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../testing/test-utils';
import Home from '../../pages/Home';

describe('Home Page', () => {
  test('renders without crashing', () => {
    renderWithProviders(<Home />);
    expect(screen.getByText).toBeDefined();
  });
});
