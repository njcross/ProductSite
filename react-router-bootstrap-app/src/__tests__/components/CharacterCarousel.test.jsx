import { render } from '@testing-library/react';
import CharacterCarousel from './CharacterCarousel';

test('renders CharacterCarousel without crashing', () => {
  render(<CharacterCarousel filter={[1]} />);
});
