import React from 'react';
import { render, screen } from '@testing-library/react';
import FavoritesPage from '../pages/FavoritesPage';

describe('FavoritesPage Page', () => {
  test('renders without crashing', () => {
    render(<FavoritesPage />);
    expect(screen.getByText).toBeDefined();
  });
});
