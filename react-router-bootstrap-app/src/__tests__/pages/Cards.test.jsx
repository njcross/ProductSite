import React from 'react';
import { render, screen } from '../../testing/test-utils';
import Cards from '../../pages/Cards';

describe('Cards Page', () => {
  test('renders without crashing', () => {
    render(<Cards />);
    expect(screen.getByText).toBeDefined();
  });
});
