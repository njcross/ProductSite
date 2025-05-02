import React from 'react';
import { render, screen } from '@testing-library/react';
import KitsLandingPage from '../pages/KitsLandingPage';

describe('KitsLandingPage Page', () => {
  test('renders without crashing', () => {
    render(<KitsLandingPage />);
    expect(screen.getByText).toBeDefined();
  });
});
