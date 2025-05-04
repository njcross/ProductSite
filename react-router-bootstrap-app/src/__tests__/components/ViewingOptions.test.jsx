import ViewingOptions from '../../components/ViewingOptions';
import { render, screen } from '../../testing/test-utils';

test('renders ViewingOptions', () => {
  render(<ViewingOptions onOptionChange={() => {}} options={{}} />);
});
