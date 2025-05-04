import EditableField from '../../components/EditableField';
import { renderWithProviders, screen } from '../../testing/test-utils';

test('renders EditableField with contentKey', () => {
  renderWithProviders(<EditableField contentKey="content_1" />);
});
