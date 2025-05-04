import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../testing/test-utils';
import About from '../../pages/About';

describe('About Page', () => {
  test('renders without crashing', () => {
    renderWithProviders(<About />);
    expect(screen.getByText).toBeDefined();
  });
});
