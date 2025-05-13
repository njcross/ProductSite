import { render } from '@testing-library/react';
import SocialShareButtons from '../../components/SocialShareButtons';

describe('SocialShareButtons', () => {
  test('renders share buttons', () => {
    const { container } = render(<SocialShareButtons />);
    expect(container).toBeInTheDocument();
  });
});
