import EditableImage from '../../components/EditableImage';
import { render, screen } from '../../testing/test-utils';

test('renders EditableImage with contentKey', () => {
  render(<EditableImage contentKey="content_img_1" />);
});
