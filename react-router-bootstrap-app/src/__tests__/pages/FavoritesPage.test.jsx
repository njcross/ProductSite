import React from 'react';
import { render, screen } from '../../testing/test-utils';
import FavoritesPage from '../../pages/FavoritesPage';

describe('FavoritesPage Page', () => {
  test('renders without crashing', () => {
    render(<FavoritesPage />);
    expect(screen.getByText).toBeDefined();
  });
});
