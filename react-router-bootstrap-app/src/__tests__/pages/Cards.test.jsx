import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../testing/test-utils';
import Cards from '../../pages/Cards';

describe('Cards Page', () => {
  test('renders without crashing', () => {
    renderWithProviders(<Cards />);
    expect(screen.getByText).toBeDefined();
  });
});
