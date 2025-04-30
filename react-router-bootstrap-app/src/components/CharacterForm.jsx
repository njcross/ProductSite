import { useState, useEffect } from 'react';


import EditableField from '../components/EditableField';import { Form, Button } from 'react-bootstrap';
import './CharacterForm.css';

export default function CharacterForm({ initialData, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    alias: '',
    alignment: '',
    powers: '',
    image_url: '',
    price: ''
  });

  const [urlError, setUrlError] = useState('');

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'image_url') {
      try {
        new URL(value);
        setUrlError('');
      } catch (err) {
        setUrlError('Please enter a valid URL');
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (urlError) {
      alert('Please fix the URL field before submitting.');
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="character-form-wrapper">
    <Form onSubmit={handleSubmit} className="character-form">
      <Form.Group controlId="name">
        <Form.Label>{<EditableField contentKey="content_2" />}</Form.Label>
        <Form.Control name="name" value={formData.name} onChange={handleChange} required />
      </Form.Group>

      <Form.Group controlId="alias">
        <Form.Label>{<EditableField contentKey="content_3" />}</Form.Label>
        <Form.Control name="alias" value={formData.alias} onChange={handleChange} required />
      </Form.Group>

      <Form.Group controlId="alignment">
        <Form.Label>{<EditableField contentKey="content_4" />}</Form.Label>
        <Form.Select name="alignment" value={formData.alignment} onChange={handleChange} required>
          <option value="">{<EditableField contentKey="content_5" />}</option>
          <option value="hero">{<EditableField contentKey="content_6" />}</option>
          <option value="villain">{<EditableField contentKey="content_7" />}</option>
        </Form.Select>
      </Form.Group>

      <Form.Group controlId="powers">
        <Form.Label>{<EditableField contentKey="content_8" />}</Form.Label>
        <Form.Control name="powers" value={formData.powers} onChange={handleChange} required />
      </Form.Group>

      <Form.Group controlId="image_url">
        <Form.Label>{<EditableField contentKey="content_9" />}</Form.Label>
        <Form.Control
          name="image_url"
          value={formData.image_url}
          onChange={handleChange}
          isInvalid={!!urlError}
          required
        />
        <Form.Control.Feedback type="invalid">
          {urlError}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group controlId="formPrice">
      <Form.Label>{<EditableField contentKey="content_10" />}</Form.Label>
      <Form.Control
        type="number"
        step="0.01"
        name="price"
        value={formData.price}
        onChange={handleChange}
        required
      />
    </Form.Group>


      <Button type="submit" className="mt-3">
        {initialData ? 'Update' : 'Create'}
      </Button>
    </Form>
    </div>
  );
}
