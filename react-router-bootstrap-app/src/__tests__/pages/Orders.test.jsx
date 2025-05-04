import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../testing/test-utils';
import Orders from '../../pages/Orders';

describe('Orders Page', () => {
  test('renders without crashing', () => {
    renderWithProviders(<Orders />);
    expect(screen.getByText).toBeDefined();
  });
});
