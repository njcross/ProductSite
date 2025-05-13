import { renderWithProviders } from '../../testing/test-utils';
import { screen } from '@testing-library/react';
import FeatureSection from '../../components/FeatureSection';

describe('FeatureSection', () => {
  test('renders feature headings', () => {
    renderWithProviders(<FeatureSection />);
    expect(screen.getByText("📋")).toBeInTheDocument();
  });
});
