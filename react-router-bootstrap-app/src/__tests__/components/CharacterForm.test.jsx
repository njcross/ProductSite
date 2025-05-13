import { renderWithProviders } from '../../testing/test-utils';
import { screen } from '@testing-library/react';
import CharacterForm from '../../components/CharacterForm';

describe('CharacterForm', () => {
  test('renders form elements', () => {
    const { getByLabelText } = renderWithProviders(<CharacterForm onSubmit={() => {}} />);
    expect(screen.getByText("Or upload image")).toBeInTheDocument();
  });
});
