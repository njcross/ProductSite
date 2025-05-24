import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ResourcesPage from '../../pages/ResourcesPage';

const mockResources = [
  {
    id: 1,
    title: 'First Resource',
    description: 'Test description',
    thumbnail_url: 'https://example.com/thumb.jpg',
    file_url: 'https://example.com/test.pdf'
  }
];

describe('ResourcesPage', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResources),
      })
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders list of resources from API', async () => {
    render(<ResourcesPage isAdmin={false} />, { wrapper: MemoryRouter });

    expect(await screen.findByText(/First Resource/i)).toBeInTheDocument();
    expect(screen.getByText(/Test description/i)).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', mockResources[0].thumbnail_url);
  });
});
