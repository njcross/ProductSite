// src/App.test.js
import { render, screen } from '@testing-library/react'
import App from '../App'
test('renders Search characters input', () => {
  render(<App />);
  const searchInput = screen.getByPlaceholderText(/search characters/i);
  expect(searchInput).toBeInTheDocument();
});
