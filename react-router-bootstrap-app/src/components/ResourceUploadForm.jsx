import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import './ResourceUploadForm.css';

export default function ResourceUploadForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: null,
    file: null,
  });
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
    setError('');
    setSuccess('');

    if (!formData.thumbnail || !formData.file) {
      setError('Please upload both a thumbnail and a file.');
      return;
    }

    try {
      const thumbData = new FormData();
      thumbData.append('image', formData.thumbnail);
      const thumbRes = await fetch(`${API_BASE}/api/upload-image`, {
        method: 'POST',
        credentials: 'include',
        body: thumbData,
      });
      const { url: thumbnail_url } = await thumbRes.json();

      const fileData = new FormData();
      fileData.append('image', formData.file); // same endpoint supports file uploads
      const fileRes = await fetch(`${API_BASE}/api/upload-image`, {
        method: 'POST',
        credentials: 'include',
        body: fileData,
      });
      const { url: file_url } = await fileRes.json();

      const res = await fetch(`${API_BASE}/api/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          thumbnail_url,
          file_url,
        }),
      });

      if (!res.ok) throw new Error('Failed to upload resource.');
      setSuccess('Resource uploaded successfully!');
      setFormData({ title: '', description: '', thumbnail: null, file: null });
    } catch (err) {
      console.error(err);
      setError(err.message);
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
