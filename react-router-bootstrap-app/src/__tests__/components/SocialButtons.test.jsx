import { render } from '@testing-library/react';
import SocialButtons from '../../components/SocialButtons';

describe('SocialButtons', () => {
  test('renders button container', () => {
    const { container } = render(<SocialButtons />);
    expect(container).toBeInTheDocument();
  });
});
