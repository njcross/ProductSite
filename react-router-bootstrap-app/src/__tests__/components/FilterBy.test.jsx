import FilterBy from '../../components/FilterBy';
import { renderWithProviders, screen } from '../../testing/test-utils';


test('renders FilterBy', () => {
  renderWithProviders(<FilterBy onFilterChange={() => {}} filters={{}} />);
});
