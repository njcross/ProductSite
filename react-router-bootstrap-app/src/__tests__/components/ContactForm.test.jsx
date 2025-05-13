import { renderWithProviders, screen } from '../../testing/test-utils';
import ContactForm from '../../components/ContactForm';

describe('ContactForm', () => {
  test('renders contact form', () => {
    const { getByPlaceholderText } = renderWithProviders(<ContactForm />);
    expect(getByPlaceholderText(/email/i)).toBeInTheDocument();
  });
});
