import { render, screen } from '@testing-library/react';
import ResourceCard from '../../components/ResourceCard';

// 🔧 Mock the context
jest.mock('../../context/UserContext', () => ({
  useUser: () => ({
    currentUser: { role: 'admin' }, // or null for non-admin
  }),
}));

const mockResource = {
  id: 1,
  title: 'Test Resource',
  description: 'This is a test resource',
  thumbnail_url: '/images/test.jpg',
  file_url: '/files/test.pdf',
};

describe('ResourceCard', () => {
  test('renders title, description, image and download link', () => {
    render(<ResourceCard resource={mockResource} />);
    expect(screen.getByRole('heading', { name: /Test Resource/i })).toBeInTheDocument();
    expect(screen.getByText(/This is a test resource/i)).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', expect.stringContaining(mockResource.thumbnail_url));
    expect(screen.getByRole('link', { name: /Download/i })).toHaveAttribute('href', expect.stringContaining(mockResource.file_url));
  });

  test('renders delete button for admin', () => {
    render(<ResourceCard resource={mockResource} />);
    expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
  });
});
