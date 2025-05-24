import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
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
      <MemoryRouter>
        <ResourcesPage isAdmin={false} />
      </MemoryRouter>
    </HelmetProvider>
  );

  expect(await screen.findByText(/First Resource/i)).toBeInTheDocument();
  expect(screen.getByText(/Test description/i)).toBeInTheDocument();
});
