import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../testing/test-utils';
import KitsLandingPage from '../../pages/KitsLandingPage';

describe('KitsLandingPage Page', () => {
  test('renders without crashing', () => {
    renderWithProviders(<KitsLandingPage />);
    expect(screen.getByText).toBeDefined();
  });
});
