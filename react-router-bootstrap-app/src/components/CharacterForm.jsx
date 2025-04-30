import { useState, useEffect } from 'react';
import { Form, Button, Alert, Row, Col, InputGroup } from 'react-bootstrap';
import EditableField from '../components/EditableField';
import './CharacterForm.css';

export default function CharacterForm({ initialData, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    image_url: '',
    price: '',
    description: '',
    age_ids: [],
    category_ids: [],
  });

  const API_BASE = process.env.REACT_APP_API_URL;
  const [urlError, setUrlError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [ageOptions, setAgeOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [newAge, setNewAge] = useState('');
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/kits/age-options`)
      .then(res => res.json())
      .then(setAgeOptions)
      .catch(console.error);

    fetch(`${API_BASE}/api/kits/category-options`)
      .then(res => res.json())
      .then(setCategoryOptions)
      .catch(console.error);

    if (initialData) {
      setFormData({
        ...initialData,
        age_ids: initialData.ages?.map(a => String(a.id)) || [],
        category_ids: initialData.categories?.map(c => String(c.id)) || [],
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, selectedOptions } = e.target;

    if (type === 'select-multiple') {
      const selected = Array.from(selectedOptions).map(option => option.value);
      setFormData(prev => ({ ...prev, [name]: selected }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));

      if (name === 'image_url') {
        try {
          new URL(value);
          setUrlError('');
        } catch {
          setUrlError('Please enter a valid URL');
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (urlError) {
      alert('Please fix the URL field before submitting.');
      return;
    }

    try {
      await onSubmit({
        ...formData,
        age_ids: formData.age_ids.map(Number),
        category_ids: formData.category_ids.map(Number),
      });
    } catch (err) {
      console.error(err);
      setSubmitError('Error submitting form: ' + (err.error || err.message || 'Unknown error'));
    }
  };

  const addNewAge = async () => {
    if (!newAge.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/kits/age-options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newAge.trim() }),
      });
      if (!res.ok) throw new Error('Failed to add age');
      const added = await res.json();
      setAgeOptions(prev => [...prev, added]);
      setFormData(prev => ({ ...prev, age_ids: [...prev.age_ids, String(added.id)] }));
      setNewAge('');
    } catch (err) {
      alert('Error adding new age: ' + err.message);
    }
  };

  const addNewCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/kits/category-options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory.trim() }),
      });
      if (!res.ok) throw new Error('Failed to add category');
      const added = await res.json();
      setCategoryOptions(prev => [...prev, added]);
      setFormData(prev => ({ ...prev, category_ids: [...prev.category_ids, String(added.id)] }));
      setNewCategory('');
    } catch (err) {
      alert('Error adding new category: ' + err.message);
    }
  };
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const data = new FormData();
    data.append('image', file);
  
    try {
      const res = await fetch(`${API_BASE}/api/upload-image`, {
        method: 'POST',
        credentials: 'include',
        body: data
      });
  
      if (!res.ok) throw new Error('Image upload failed');
      const result = await res.json();
  
      // Update formData with new image_url
      setFormData(prev => ({ ...prev, image_url: result.url }));
      setUrlError('');
    } catch (err) {
      console.error(err);
      setUrlError('Upload failed: ' + err.message);
    }
  };
  

  return (
    <div className="character-form-wrapper">
      <Form onSubmit={handleSubmit} className="character-form">
        {submitError && <Alert variant="danger">{submitError}</Alert>}

        <Form.Group controlId="name">
          <Form.Label><EditableField contentKey="content_2" /></Form.Label>
          <Form.Control name="name" value={formData.name} onChange={handleChange} required />
        </Form.Group>

        <Form.Group controlId="image_url">
          <Form.Label><EditableField contentKey="content_9" /></Form.Label>
          <Form.Control
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            isInvalid={!!urlError}
            placeholder="https://example.com/image.png"
          />
          <Form.Control.Feedback type="invalid">{urlError}</Form.Control.Feedback>

          <Form.Label className="mt-2">Or upload image</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={handleUpload}
          />
        </Form.Group>


        <Form.Group controlId="formPrice">
          <Form.Label><EditableField contentKey="content_10" /></Form.Label>
          <Form.Control
            type="number"
            step="0.01"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="description">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="age_ids">
          <Form.Label>Target Age Range</Form.Label>
          <Form.Select multiple name="age_ids" value={formData.age_ids} onChange={handleChange}>
            {ageOptions.map(age => (
              <option key={age.id} value={String(age.id)}>{age.name}</option>
            ))}
          </Form.Select>
          <InputGroup className="mt-2">
            <Form.Control
              placeholder="New age option"
              value={newAge}
              onChange={e => setNewAge(e.target.value)}
            />
            <Button onClick={addNewAge}>+</Button>
          </InputGroup>
        </Form.Group>

        <Form.Group controlId="category_ids">
          <Form.Label>Kit Categories</Form.Label>
          <Form.Select multiple name="category_ids" value={formData.category_ids} onChange={handleChange}>
            {categoryOptions.map(cat => (
              <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
            ))}
          </Form.Select>
          <InputGroup className="mt-2">
            <Form.Control
              placeholder="New category option"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
            />
            <Button onClick={addNewCategory}>+</Button>
          </InputGroup>
        </Form.Group>

        <Button type="submit" className="mt-3">
          {initialData ? 'Update' : 'Create'}
        </Button>
      </Form>
    </div>
  );
}
