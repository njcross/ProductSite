import { useEffect, useState } from 'react';
import './FilterBy.css';
import EditableField from '../components/EditableField';

export default function FilterBy({ 
  onFilterChange, 
  selectedAges = [], 
  selectedCategories = [],
  savedFilters = [], 
  onSelectSavedFilter, 
  onDeleteSavedFilter, 
  currentUser 
}) {
  const API_BASE = process.env.REACT_APP_API_URL;
  const [ageOptions, setAgeOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/kits/age-options`)
      .then(res => res.json())
      .then(setAgeOptions)
      .catch(console.error);

    fetch(`${API_BASE}/api/kits/category-options`)
      .then(res => res.json())
      .then(setCategoryOptions)
      .catch(console.error);
  }, []);

  const handleMultiSelectChange = (e, type) => {
    const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
    onFilterChange({ [type]: selected });
  };

  return (
    <div className="filter-by">

      <label>Filter by Age</label>
      <select multiple value={selectedAges} onChange={e => handleMultiSelectChange(e, 'age_ids')}>
        {ageOptions.map(age => (
          <option key={age.id} value={String(age.id)}>{age.name}</option>
        ))}
      </select>

      <label>Filter by Category</label>
      <select multiple value={selectedCategories} onChange={e => handleMultiSelectChange(e, 'category_ids')}>
        {categoryOptions.map(cat => (
          <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
        ))}
      </select>

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
    </div>
  );
}
