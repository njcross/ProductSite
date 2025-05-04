import React from 'react';
import { render, screen } from '../../testing/test-utils';
import NewsletterList from '../../pages/NewsLetterList';

describe('NewsLetterList Page', () => {
  test('renders without crashing', () => {
    render(<NewsletterList />);
    expect(screen.getByText).toBeDefined();
  });
});
