import { render } from '@testing-library/react';
import EditableImage from './EditableImage';

test('renders EditableImage with contentKey', () => {
  render(<EditableImage contentKey="content_img_1" />);
});
