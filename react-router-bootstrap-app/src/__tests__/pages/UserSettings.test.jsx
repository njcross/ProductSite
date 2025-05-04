import React from 'react';
import { render, screen } from '../../testing/test-utils';
import UserSettings from '../../pages/UserSettings';

describe('UserSettings Page', () => {
  test('renders without crashing', () => {
    render(<UserSettings />);
    expect(screen.getByText).toBeDefined();
  });
});
