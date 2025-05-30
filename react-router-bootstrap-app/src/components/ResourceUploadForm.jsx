import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import './ResourceUploadForm.css';

export default function ResourceUploadForm() {
  const initialFormState = {
    title: '',
    description: '',
    thumbnail: null,
    file: null,
  };

const [formData, setFormData] = useState(initialFormState);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_BASE = process.env.REACT_APP_API_URL;

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Upload thumbnail
      const thumbData = new FormData();
      thumbData.append('image', formData.thumbnail);
      const thumbRes = await fetch(`${API_BASE}/api/upload-image`, { method: 'POST', body: thumbData, credentials: 'include' });
      const thumbResult = await thumbRes.json();

      // Upload file
      const fileData = new FormData();
      fileData.append('image', formData.file); // assuming same upload endpoint
      const fileRes = await fetch(`${API_BASE}/api/upload-image`, { method: 'POST', body: fileData, credentials: 'include' });
      const fileResult = await fileRes.json();

      // Create resource
      const res = await fetch(`${API_BASE}/api/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          thumbnail_url: thumbResult.url,
          file_url: fileResult.url,
        }),
      });

      if (res.ok) {
        setFormData(initialFormState);
        if (onUploadSuccess) onUploadSuccess();
      } else {
        alert('Failed to upload resource');
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    }
  };

  return (
    <div className="resource-upload-form">
      <h2>Upload New Resource</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Label>Title</Form.Label>
          <Form.Control name="title" value={formData.title} onChange={handleChange} required />
        </Form.Group>

        <Form.Group>
          <Form.Label>Description</Form.Label>
          <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} required />
        </Form.Group>

        <Form.Group>
          <Form.Label>Thumbnail Image</Form.Label>
          <Form.Control type="file" name="thumbnail" accept="image/*" onChange={handleChange} required />
        </Form.Group>

        <Form.Group>
          <Form.Label>Downloadable File</Form.Label>
          <Form.Control type="file" name="file" onChange={handleChange} required />
        </Form.Group>

        <Button type="submit" className="mt-3">Upload</Button>
      </Form>
    </div>
  );
}
