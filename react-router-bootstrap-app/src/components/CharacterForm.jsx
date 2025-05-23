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
    theme_ids: [],
    grade_ids: [],
    inventories: [],
  });

  const API_BASE = process.env.REACT_APP_API_URL;
  const [urlError, setUrlError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [ageOptions, setAgeOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [themeOptions, setThemeOptions] = useState([]);
  const [gradeOptions, setGradeOptions] = useState([]);
  const [newAge, setNewAge] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newTheme, setNewTheme] = useState('');
  const [newGrade, setNewGrade] = useState('');
  const [inventoryOptions, setInventoryOptions] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/kits/age-options`)
      .then(res => res.json())
      .then(setAgeOptions)
      .catch(console.error);

    fetch(`${API_BASE}/api/kits/category-options`)
      .then(res => res.json())
      .then(setCategoryOptions)
      .catch(console.error);

    fetch(`${API_BASE}/api/kits/theme-options`)
      .then(res => res.json())
      .then(setThemeOptions)
      .catch(console.error);

    fetch(`${API_BASE}/api/kits/grade-options`)
      .then(res => res.json())
      .then(setGradeOptions)
      .catch(console.error);

    fetch(`${API_BASE}/api/inventory/locations`)
      .then(res => res.json())
      .then(setInventoryOptions)
      .catch(console.error);
  }, [API_BASE]);

  useEffect(() => {
    if (initialData && ageOptions.length && categoryOptions.length) {
      setFormData({
        ...initialData,
        age_ids: initialData.age?.map(a => String(a.id)) || [],
        category_ids: initialData.category?.map(c => String(c.id)) || [],
        theme_ids: initialData.theme?.map(t => String(t.id)) || [],
        grade_ids: initialData.grade?.map(g => String(g.id)) || [],
      });
    }
  }, [initialData, ageOptions, categoryOptions, themeOptions, gradeOptions]);

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
      const kit = await onSubmit({
        ...formData,
        age_ids: formData.age_ids.map(Number),
        category_ids: formData.category_ids.map(Number),
        theme_ids: formData.theme_ids.map(Number),
        grade_ids: formData.grade_ids.map(Number),
      });

      // If this is a new kit and has inventories
      if (!initialData && kit?.id && formData.inventories.length > 0) {
        for (const inv of formData.inventories) {
          await fetch(`${API_BASE}/api/inventories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              ...inv,
              kit_id: kit.id,
            }),
          });
        }
      }
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

  const addNewTheme = async () => {
    if (!newTheme.trim()) return; 
    try {
      const res = await fetch(`${API_BASE}/api/kits/theme-options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTheme.trim() }),
      });
    if (!res.ok) throw new Error('Failed to add theme');
      const added = await res.json();
      setThemeOptions(prev => [...prev, added]);  
      setFormData(prev => ({ ...prev, theme_ids: [...prev.theme_ids, String(added.id)] }));
      setNewTheme('');
    } catch (err) {
      alert('Error adding new theme: ' + err.message);
    }
  };

  const addNewGrade = async () => {
    if (!newGrade.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/kits/grade-options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGrade.trim() }),
      });
    if (!res.ok) throw new Error('Failed to add grade');
      const added = await res.json();
      setGradeOptions(prev => [...prev, added]);
      setFormData(prev => ({ ...prev, grade_ids: [...prev.grade_ids, String(added.id)] }));
      setNewGrade('');
    } catch (err) {
      alert('Error adding new grade: ' + err.message);
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
            accept="images/*"
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
  <div className="custom-select-list">
    {ageOptions.map(age => (
      <div key={age.id} className="select-option">
        <Form.Check 
          type="checkbox"
          inline
          label={age.name}
          value={String(age.id)}
          checked={formData.age_ids.includes(String(age.id))}
          onChange={(e) => {
            const selected = e.target.checked
              ? [...formData.age_ids, e.target.value]
              : formData.age_ids.filter(id => id !== e.target.value);
            setFormData(prev => ({ ...prev, age_ids: selected }));
          }}
        />
        <Button
          size="sm"
          variant="outline-danger"
          onClick={async () => {
            if (window.confirm(`Delete age "${age.name}"?`)) {
              await fetch(`${API_BASE}/api/kits/age-options/${age.id}`, {
                method: 'DELETE',
                credentials: 'include'
              });
              setAgeOptions(prev => prev.filter(a => a.id !== age.id));
              setFormData(prev => ({
                ...prev,
                age_ids: prev.age_ids.filter(id => id !== String(age.id))
              }));
            }
          }}
        >
          ×
        </Button>
      </div>
    ))}
  </div>

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
  <div className="custom-select-list">
    {categoryOptions.map(cat => (
      <div key={cat.id} className="select-option">
        <Form.Check 
          type="checkbox"
          inline
          label={cat.name}
          value={String(cat.id)}
          checked={formData.category_ids.includes(String(cat.id))}
          onChange={(e) => {
            const selected = e.target.checked
              ? [...formData.category_ids, e.target.value]
              : formData.category_ids.filter(id => id !== e.target.value);
            setFormData(prev => ({ ...prev, category_ids: selected }));
          }}
        />
        <Button
          size="sm"
          variant="outline-danger"
          onClick={async () => {
            if (window.confirm(`Delete category "${cat.name}"?`)) {
              await fetch(`${API_BASE}/api/kits/category-options/${cat.id}`, {
                method: 'DELETE',
                credentials: 'include'
              });
              setCategoryOptions(prev => prev.filter(c => c.id !== cat.id));
              setFormData(prev => ({
                ...prev,
                category_ids: prev.category_ids.filter(id => id !== String(cat.id))
              }));
            }
          }}
        >
          ×
        </Button>
      </div>
    ))}
  </div>



  <InputGroup className="mt-2">
    <Form.Control
      placeholder="New category option"
      value={newCategory}
      onChange={e => setNewCategory(e.target.value)}
    />
    <Button onClick={addNewCategory}>+</Button>
  </InputGroup>
</Form.Group>

<Form.Group controlId="theme_ids">
  <Form.Label>Kit Themes</Form.Label>
  <div className="custom-select-list">
    {themeOptions.map(theme => (
      <div key={theme.id} className="select-option">
        <Form.Check 
          type="checkbox"
          inline
          label={theme.name}
          value={String(theme.id)}
          checked={formData.theme_ids.includes(String(theme.id))}
          onChange={(e) => {
            const selected = e.target.checked
              ? [...formData.theme_ids, e.target.value]
              : formData.theme_ids.filter(id => id !== e.target.value);
            setFormData(prev => ({ ...prev, theme_ids: selected }));
          }}
        />
        <Button
          size="sm"
          variant="outline-danger"
          onClick={async () => {
            if (window.confirm(`Delete theme "${theme.name}"?`)) {
              await fetch(`${API_BASE}/api/kits/theme-options/${theme.id}`, {
                method: 'DELETE',
                credentials: 'include'
              });
              setThemeOptions(prev => prev.filter(t => t.id !== theme.id));
              setFormData(prev => ({
                ...prev,
                theme_ids: prev.theme_ids.filter(id => id !== String(theme.id))
              }));
            }
          }}
        >
          ×
        </Button>
      </div>
    ))}
  </div>

  <InputGroup className="mt-2">
    <Form.Control
      placeholder="New theme option"
      value={newTheme}
      onChange={e => setNewTheme(e.target.value)}
    />
    <Button onClick={addNewTheme}>+</Button>
  </InputGroup>
</Form.Group>

<Form.Group controlId="grade_ids">
  <Form.Label>Kit Grades</Form.Label>
  <div className="custom-select-list">
    {gradeOptions.map(grade => (
      <div key={grade.id} className="select-option">
        <Form.Check 
          type="checkbox"
          inline
          label={grade.name}
          value={String(grade.id)}
          checked={formData.grade_ids.includes(String(grade.id))}
          onChange={(e) => {
            const selected = e.target.checked
              ? [...formData.grade_ids, e.target.value]
              : formData.grade_ids.filter(id => id !== e.target.value);
            setFormData(prev => ({ ...prev, grade_ids: selected }));
          }}
        />
        <Button
          size="sm"
          variant="outline-danger"
          onClick={async () => {
            if (window.confirm(`Delete grade "${grade.name}"?`)) {
              await fetch(`${API_BASE}/api/kits/grade-options/${grade.id}`, {
                method: 'DELETE',
                credentials: 'include'
              });
              setGradeOptions(prev => prev.filter(g => g.id !== grade.id));
              setFormData(prev => ({
                ...prev,
                grade_ids: prev.grade_ids.filter(id => id !== String(grade.id))
              }));
            }
          }}
        >
          ×
        </Button>
      </div>
    ))}
  </div>

  <InputGroup className="mt-2">
    <Form.Control
      placeholder="New grade option"
      value={newGrade}
      onChange={e => setNewGrade(e.target.value)}
    />
    <Button onClick={addNewGrade}>+</Button>
  </InputGroup>
</Form.Group>


        {/* INVENTORY FIELDS (only show if creating) */}
        {!initialData && (
          <Form.Group>
          <Form.Label>Inventory Locations</Form.Label>
          {[
            ...new Map(
              formData.inventories.map(inv => [`${inv.location}-${inv.location_name}`, inv])
            ).values()
          ].map((inv, index) => (
            <Row key={index} className="mb-2">
              <Col>
                <Form.Control
                  placeholder="Location"
                  value={inv.location}
                  onChange={(e) => {
                    const inventories = [...formData.inventories];
                    inventories[index].location = e.target.value;
                    setFormData({ ...formData, inventories });
                  }}
                />
              </Col>
              <Col>
                <Form.Control
                  placeholder="Location Name"
                  list="locationNames"
                  value={inv.location_name}
                  onChange={(e) => {
                    const inventories = [...formData.inventories];
                    inventories[index].location_name = e.target.value;
                    setFormData({ ...formData, inventories });
                  }}
                />
                <datalist id="locationNames">
                  {[...new Set(inventoryOptions.map(i => i.location_name))].map((name, i) => (
                    <option key={i} value={name} />
                  ))}
                </datalist>
              </Col>
              <Col>
                <Form.Control
                  type="number"
                  min="0"
                  placeholder="Quantity"
                  value={inv.quantity}
                  onChange={(e) => {
                    const inventories = [...formData.inventories];
                    inventories[index].quantity = e.target.value;
                    setFormData({ ...formData, inventories });
                  }}
                />
              </Col>
              <Col xs="auto">
                <Button
                  variant="outline-danger"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      inventories: formData.inventories.filter((_, i) => i !== index),
                    });
                  }}
                >
                  ×
                </Button>
              </Col>
            </Row>
          ))}

          <Button
            variant="outline-primary"
            onClick={() => {
              setFormData({
                ...formData,
                inventories: [...formData.inventories, { location: '', location_name: '', quantity: 0 }],
              });
            }}
          >
            + Add Inventory
          </Button>
        </Form.Group>
        

        
        )}

        

        <Button type="submit" className="mt-3">
          {initialData ? 'Update' : 'Create'}
        </Button>
      </Form>
    </div>
  );
}
