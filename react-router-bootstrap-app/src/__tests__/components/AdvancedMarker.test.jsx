import { render } from '@testing-library/react';
import AdvancedMarker from '../../components/AdvancedMarker';

describe('AdvancedMarker', () => {
  test('renders without crashing', () => {
    render(<AdvancedMarker position={{ lat: 0, lng: 0 }} title="Test" />);
  });
});
