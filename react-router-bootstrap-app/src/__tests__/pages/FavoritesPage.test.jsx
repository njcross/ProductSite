import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../testing/test-utils';
import FavoritesPage from '../../pages/FavoritesPage';

describe('FavoritesPage Page', () => {
  test('renders without crashing', () => {
    renderWithProviders(<FavoritesPage />);
    expect(screen.getByText).toBeDefined();
  });
});
