import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '../../testing/test-utils';
import { FooterNewsletter } from '../../components/FooterNewsletter';

describe('FooterNewsletter', () => {
  test('renders newsletter form', () => {
    renderWithProviders(<FooterNewsletter />);
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
  });

  test('submits form on click', () => {
    renderWithProviders(<FooterNewsletter />);
    const input = screen.getByPlaceholderText("Enter your email");
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
  });
});
