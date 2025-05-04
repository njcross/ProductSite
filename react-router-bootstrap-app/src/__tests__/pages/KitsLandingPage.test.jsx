import React from 'react';
import { render, screen } from '../../testing/test-utils';
import KitsLandingPage from '../../pages/KitsLandingPage';

describe('KitsLandingPage Page', () => {
  test('renders without crashing', () => {
    render(<KitsLandingPage />);
    expect(screen.getByText).toBeDefined();
  });
});
