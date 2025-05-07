import { useEffect, useState } from 'react';
import './FilterBy.css';
import EditableField from '../components/EditableField';

export default function FilterBy({ 
  onFilterChange, 
  selectedAges = [], 
  selectedCategories = [],
  selectedLocations = [],
  savedFilters = [], 
  onSelectSavedFilter, 
  onDeleteSavedFilter, 
  currentUser,
  onSaveFilter
}) {
  const API_BASE = process.env.REACT_APP_API_URL;
  const [ageOptions, setAgeOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [selectedRating, setSelectedRating] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/kits/age-options`)
      .then(res => res.json())
      .then(setAgeOptions)
      .catch(console.error);

    fetch(`${API_BASE}/api/kits/category-options`)
      .then(res => res.json())
      .then(setCategoryOptions)
      .catch(console.error);

    fetch(`${API_BASE}/api/inventory/locations`)
      .then(res => res.json())
      .then(data => setLocationOptions)
      .catch(console.error);
  }, []);

  const handleToggle = (type, id) => {
    const selected = type === 'age_ids' ? selectedAges : selectedCategories;
    const newSelected = selected.includes(id)
      ? selected.filter(i => i !== id)
      : [...selected, id];
    onFilterChange({ [type]: newSelected });
  };

  const handleRatingChange = (e) => {
    const value = e.target.value;
    setSelectedRating(value);
    onFilterChange({ rating: value });
  };

  const deleteAge = async (id) => {
    if (!window.confirm('Are you sure you want to delete this age option?')) return;
    await fetch(`${API_BASE}/api/kits/age-options/${id}`, { method: 'DELETE', credentials: 'include' });
    setAgeOptions(prev => prev.filter(a => a.id !== id));
    onFilterChange({ age_ids: selectedAges.filter(aid => aid !== id) });
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category option?')) return;
    await fetch(`${API_BASE}/api/kits/category-options/${id}`, { method: 'DELETE', credentials: 'include' });
    setCategoryOptions(prev => prev.filter(c => c.id !== id));
    onFilterChange({ category_ids: selectedCategories.filter(cid => cid !== id) });
  };

  return (
    <div className="filter-by">
      <label>Filter by Age</label>
      <ul className="filter-list">
        {ageOptions.map(age => (
          <li key={age.id}>
            <input
              type="checkbox"
              checked={selectedAges.includes(String(age.id))}
              onChange={() => handleToggle('age_ids', String(age.id))}
            />
            {age.name}
            {currentUser?.role === 'admin' && (
              <button onClick={() => deleteAge(age.id)} className="delete-btn">×</button>
            )}
          </li>
        ))}
      </ul>

      <label>Filter by Category</label>
      <ul className="filter-list">
        {categoryOptions.map(cat => (
          <li key={cat.id}>
            <input
              type="checkbox"
              checked={selectedCategories.includes(String(cat.id))}
              onChange={() => handleToggle('category_ids', String(cat.id))}
            />
            {cat.name}
            {currentUser?.role === 'admin' && (
              <button onClick={() => deleteCategory(cat.id)} className="delete-btn">×</button>
            )}
          </li>
        ))}
      </ul>

      <label>Filter by Minimum Rating</label>
      <div className="filter-rating">
        <select value={selectedRating} onChange={handleRatingChange}>
          <option value="">None</option>
          <option value="1">1 Star & Up</option>
          <option value="2">2 Stars & Up</option>
          <option value="3">3 Stars & Up</option>
          <option value="4">4 Stars & Up</option>
          <option value="5">5 Stars Only</option>
        </select>
      </div>

      <label>Filter by Location</label>
  <ul className="filter-list">
    {locationOptions.map((loc, idx) => (
      <li key={idx}>
        <input
          type="checkbox"
          checked={selectedLocations.includes(loc)}
          onChange={() => handleToggle('location_names', loc)}
        />
        {loc}
        {currentUser?.role === 'admin' && (
          <button onClick={() => deleteLocation(loc)} className="delete-btn">×</button>
        )}
      </li>
    ))}
  </ul>

      {currentUser && savedFilters.length > 0 && (
        <div className="saved-filters">
          <label>Favorites</label>
          <select onChange={(e) => onSelectSavedFilter(e.target.value)}>
            <option value="">Select a Saved Filter</option>
            {savedFilters.map((filter, index) => (
              <option key={index} value={filter.id}>{filter.name}</option>
            ))}
          </select>
        </div>
      )}
      {currentUser && (
              <div className="option-group">
                <button className="save-filter-btn" onClick={onSaveFilter}>
                  <EditableField contentKey="content_144" />
                </button>
              </div>
            )}
    </div>
  );
}
