import { render } from '@testing-library/react';
import EditableField from './EditableField';

test('renders EditableField with contentKey', () => {
  render(<EditableField contentKey="content_1" />);
});
