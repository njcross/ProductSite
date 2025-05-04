import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../testing/test-utils';
import UserSettings from '../../pages/UserSettings';

describe('UserSettings Page', () => {
  test('renders without crashing', () => {
    renderWithProviders(<UserSettings />);
    expect(screen.getByText).toBeDefined();
  });
});
