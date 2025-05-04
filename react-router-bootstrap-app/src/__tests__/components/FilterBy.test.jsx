import FilterBy from '../../components/FilterBy';
import { render, screen } from '../../testing/test-utils';


test('renders FilterBy', () => {
  render(<FilterBy onFilterChange={() => {}} filters={{}} />);
});
