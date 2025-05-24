import { render, screen } from '@testing-library/react';
import ResourceCard from '../../components/ResourceCard';

const mockResource = {
  id: 1,
  title: 'Test Resource',
  description: 'This is a test resource',
  thumbnail_url: 'https://example.com/thumb.jpg',
  file_url: 'https://example.com/test.pdf',
};

describe('ResourceCard', () => {
  test('renders title, description, image and download link', () => {
    render(<ResourceCard resource={mockResource} />);
    expect(screen.getByRole('heading', { name: /Test Resource/i })).toBeInTheDocument();
    expect(screen.getByText(/This is a test resource/i)).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', mockResource.thumbnail_url);
    expect(screen.getByRole('link', { name: /Download/i })).toHaveAttribute('href', mockResource.file_url);
  });
});
