import React from 'react';
import { render, screen } from '@testing-library/react';
import UserSettings from '../pages/UserSettings';

describe('UserSettings Page', () => {
  test('renders without crashing', () => {
    render(<UserSettings />);
    expect(screen.getByText).toBeDefined();
  });
});
