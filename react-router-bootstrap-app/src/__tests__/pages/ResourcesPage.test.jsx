import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ResourcesPage from '../../pages/ResourcesPage';
import { UserContext } from '../../context/UserContext';

// Mock the fetch response
const mockResources = [
  {
    id: 1,
    title: 'First Resource',
    description: 'Test description',
    thumbnail_url: 'https://example.com/thumb.jpg',
    file_url: 'https://example.com/test.pdf'
  }
];

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve(mockResources)
    })
  );
});

afterEach(() => {
  jest.resetAllMocks();
});

test('renders list of resources from API', async () => {
  render(
    <HelmetProvider>
      <UserContext.Provider value={{ currentUser: { role: 'user' } }}>
        <MemoryRouter>
          <ResourcesPage />
        </MemoryRouter>
      </UserContext.Provider>
    </HelmetProvider>
  );

  // Wait for content to load
  await waitFor(() => {
    expect(screen.getByText(/First Resource/i)).toBeInTheDocument();
    expect(screen.getByText(/Test description/i)).toBeInTheDocument();
  });
});
