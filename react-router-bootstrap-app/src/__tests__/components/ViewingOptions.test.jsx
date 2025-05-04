import ViewingOptions from '../../components/ViewingOptions';
import { renderWithProviders, screen } from '../../testing/test-utils';

test('renders ViewingOptions', () => {
  renderWithProviders(<ViewingOptions onOptionChange={() => {}} options={{}} />);
});
