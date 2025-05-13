import { render } from '@testing-library/react';
import GoogleSignInButton from '../../components/GoogleSignInButton';

describe('GoogleSignInButton', () => {
  test('renders button', () => {
    const { getByText } = render(<GoogleSignInButton />);
    expect(getByText(/sign in with google/i)).toBeInTheDocument();
  });
});
