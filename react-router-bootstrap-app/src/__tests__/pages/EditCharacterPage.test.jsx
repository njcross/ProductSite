import React from 'react';
import { render, screen } from '../../testing/test-utils';
import EditCharacterPage from '../../pages/EditCharacterPage';

describe('EditCharacterPage Page', () => {
  test('renders without crashing', () => {
    render(<EditCharacterPage />);
    expect(screen.getByText).toBeDefined();
  });
});
