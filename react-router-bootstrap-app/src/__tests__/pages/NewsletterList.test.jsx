import React from 'react';
import { render, screen } from '@testing-library/react';
import NewsletterList from '../pages/NewsletterList';

describe('NewsletterList Page', () => {
  test('renders without crashing', () => {
    render(<NewsletterList />);
    expect(screen.getByText).toBeDefined();
  });
});
