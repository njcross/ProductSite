import EditableImage from '../../components/EditableImage';
import { renderWithProviders, screen } from '../../testing/test-utils';

test('renders EditableImage with contentKey', () => {
  renderWithProviders(<EditableImage contentKey="content_img_1" />);
});
