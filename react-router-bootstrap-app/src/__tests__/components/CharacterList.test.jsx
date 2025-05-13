import { renderWithProviders } from '../../testing/test-utils';
import { screen } from '@testing-library/react';
import CharacterList from '../../components/CharacterList';

const mockCharacters = [
  { id: 1, name: 'Hero One', alias: 'Alias One', image_url: '', rating: 5 },
  { id: 2, name: 'Hero Two', alias: 'Alias Two', image_url: '', rating: 4 },
];

describe('CharacterList', () => {
  test('renders character cards', () => {
    renderWithProviders(<CharacterList characters={mockCharacters} viewMode="grid" />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
