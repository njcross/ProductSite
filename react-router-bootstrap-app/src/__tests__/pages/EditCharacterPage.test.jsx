import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../testing/test-utils';
import EditCharacterPage from '../../pages/EditCharacterPage';

describe('EditCharacterPage Page', () => {
  test('renders without crashing', () => {
    renderWithProviders(<EditCharacterPage />);
    expect(screen.getByText).toBeDefined();
  });
});
