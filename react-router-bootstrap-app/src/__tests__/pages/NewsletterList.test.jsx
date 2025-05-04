import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../testing/test-utils';
import NewsletterList from '../../pages/NewsLetterList';

describe('NewsLetterList Page', () => {
  test('renders without crashing', () => {
    renderWithProviders(<NewsletterList />);
    expect(screen.getByText).toBeDefined();
  });
});
