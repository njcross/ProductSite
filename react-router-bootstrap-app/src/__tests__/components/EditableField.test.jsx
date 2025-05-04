import EditableField from '../../components/EditableField';
import { render, screen } from '../../testing/test-utils';

test('renders EditableField with contentKey', () => {
  render(<EditableField contentKey="content_1" />);
});
