import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../testing/test-utils';
import NotFound from '../../pages/NotFound';

describe('NotFound Page', () => {
  test('renders without crashing', () => {
    renderWithProviders(<NotFound />);
    expect(screen.getByText).toBeDefined();
  });
});
