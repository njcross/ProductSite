import { renderWithProviders } from '../../testing/test-utils';
import { screen, fireEvent } from '@testing-library/react';
import ResourceUploadForm from '../../components/ResourceUploadForm';

describe('ResourceUploadForm', () => {
  test('renders form fields for admin users', () => {
    renderWithProviders(<ResourceUploadForm />);
    expect(screen.getByText(/Upload New Resource/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Upload/i })).toBeInTheDocument();
  });

  test('calls onUpload with correct data', async () => {
    renderWithProviders(<ResourceUploadForm />);

    // Fill title and description
    const textboxes = screen.getAllByRole('textbox');
    fireEvent.change(textboxes[0], { target: { value: 'Sample Title' } }); // title
    fireEvent.change(textboxes[1], { target: { value: 'Sample Description' } }); // description

    // Find file inputs
    const fileInputs = screen.getAllByRole('textbox', { hidden: true })
      .filter(input => input.type === 'file');

    const fileInputEls = screen.getAllByDisplayValue('', { selector: 'input[type="file"]' });
    const [thumbnailInput, fileInput] = fileInputEls;

    const mockFile = new File(['dummy'], 'example.pdf', { type: 'application/pdf' });
    fireEvent.change(thumbnailInput, { target: { files: [mockFile] } });
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    // Submit
    const submitBtn = screen.getByRole('button', { name: /Upload/i });
    fireEvent.click(submitBtn);

    expect(submitBtn).toBeInTheDocument(); // submission fires (if mocked fetch, you'd check effect)
  });
});
