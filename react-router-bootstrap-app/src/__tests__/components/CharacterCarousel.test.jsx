import CharacterCarousel from '../../components/CharacterCarousel';
import { render, screen } from '../../testing/test-utils';

test('renders CharacterCarousel without crashing', () => {
  render(<CharacterCarousel filter={[1]} />);
});
