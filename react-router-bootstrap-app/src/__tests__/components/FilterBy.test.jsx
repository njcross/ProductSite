import { render } from '@testing-library/react';
import FilterBy from './FilterBy';

test('renders FilterBy', () => {
  render(<FilterBy onFilterChange={() => {}} filters={{}} />);
});
