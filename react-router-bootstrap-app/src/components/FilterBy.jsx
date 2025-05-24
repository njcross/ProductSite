import { useEffect, useState } from 'react';
import './FilterBy.css';
import EditableField from '../components/EditableField';
import ReactSlider from 'react-slider';
import './Slider.css';


export default function FilterBy({
  onFilterChange,
  selectedAges = [],
  selectedCategories = [],
  selectedThemes = [],
  selectedGrades = [],
  selectedLocations = [],
  savedFilters = [],
  onSelectSavedFilter,
  onDeleteSavedFilter,
  currentUser,
  onSaveFilter,
  collection = 'default'
}) {
  const API_BASE = process.env.REACT_APP_API_URL;
  const [ageOptions, setAgeOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [themeOptions, setThemeOptions] = useState([]);
  const [gradeOptions, setGradeOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [selectedRating, setSelectedRating] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const MIN_PRICE = 0;
  const MAX_PRICE = 30;

  const [priceRange, setPriceRange] = useState([MIN_PRICE, MAX_PRICE]);

  const localKey = `filters_${collection}`;

  useEffect(() => {
    fetch(`${API_BASE}/api/kits/age-options`).then(res => res.json()).then(setAgeOptions).catch(console.error);
    fetch(`${API_BASE}/api/kits/category-options`).then(res => res.json()).then(setCategoryOptions).catch(console.error);
    fetch(`${API_BASE}/api/kits/theme-options`).then(res => res.json()).then(setThemeOptions).catch(console.error);
    fetch(`${API_BASE}/api/kits/grade-options`).then(res => res.json()).then(setGradeOptions).catch(console.error);
    fetch(`${API_BASE}/api/inventory/locations`).then(res => res.json()).then(setLocationOptions).catch(console.error);

    const saved = localStorage.getItem(localKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      setSelectedRating(parsed.rating || '');
      if (parsed.price_range && Array.isArray(parsed.price_range)) {
        setPriceRange(parsed.price_range);
      }
      onFilterChange(parsed);
    }
  }, [API_BASE, collection]);

  useEffect(() => {
    const filtersToSave = {
      age_ids: selectedAges,
      category_ids: selectedCategories,
      theme_ids: selectedThemes,
      grade_ids: selectedGrades,
      location_names: selectedLocations,
      rating: selectedRating,
      price_range: priceRange
    };
    localStorage.setItem(localKey, JSON.stringify(filtersToSave));
  }, [
    selectedAges,
    selectedCategories,
    selectedThemes,
    selectedGrades,
    selectedLocations,
    selectedRating,
    priceRange
  ]);

  const handleToggle = (type, id) => {
    const currentSelections = {
      age_ids: selectedAges,
      category_ids: selectedCategories,
      theme_ids: selectedThemes,
      grade_ids: selectedGrades,
      location_names: selectedLocations
    }[type] || [];

    const newSelected = currentSelections.includes(id)
      ? currentSelections.filter(i => i !== id)
      : [...currentSelections, id];

    onFilterChange({ [type]: newSelected });
  };

  const handleRatingChange = (e) => {
    const value = e.target.value;
    setSelectedRating(value);
    onFilterChange({ rating: value });
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    const [min, max] = value.split('_').map(Number);
    setPriceRange([min, max]);
    onFilterChange({ price_range: value });
  };

  return (
    <div className="filter-by">
      <label><EditableField contentKey="content_301" defaultText="Filter by Age" /></label>
      <ul className="filter-list">
        {ageOptions.map(age => (
          <li key={age.id}>
            <input
              type="checkbox"
              checked={selectedAges.includes(String(age.id))}
              onChange={() => handleToggle('age_ids', String(age.id))}
            />
            {age.name}
          </li>
        ))}
      </ul>

      <label><EditableField contentKey="content_302" defaultText="Filter by Category" /></label>
      <ul className="filter-list">
        {categoryOptions.map(cat => (
          <li key={cat.id}>
            <input
              type="checkbox"
              checked={selectedCategories.includes(String(cat.id))}
              onChange={() => handleToggle('category_ids', String(cat.id))}
            />
            {cat.name}
          </li>
        ))}
      </ul>

      <label><EditableField contentKey="content_303" defaultText="Filter by Theme" /></label>
      <ul className="filter-list">
        {themeOptions.map(theme => (
          <li key={theme.id}>
            <input
              type="checkbox"
              checked={selectedThemes.includes(String(theme.id))}
              onChange={() => handleToggle('theme_ids', String(theme.id))}
            />
            {theme.name}
          </li>
        ))}
      </ul>

      <label><EditableField contentKey="content_304" defaultText="Filter by Grade" /></label>
      <ul className="filter-list">
        {gradeOptions.map(grade => (
          <li key={grade.id}>
            <input
              type="checkbox"
              checked={selectedGrades.includes(String(grade.id))}
              onChange={() => handleToggle('grade_ids', String(grade.id))}
            />
            {grade.name}
          </li>
        ))}
      </ul>

      <label><EditableField contentKey="content_305" defaultText="Filter by Minimum Rating" /></label>
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

      <label><EditableField contentKey="content_306" defaultText="Filter by Price" /></label>
      <div className="filter-price">
        <div className="price-values">
          ${priceRange[0]} – ${priceRange[1]}
        </div>
        <ReactSlider
          className="price-slider"
          thumbClassName="slider-thumb"
          trackClassName="slider-track"
          min={MIN_PRICE}
          max={MAX_PRICE}
          value={priceRange}
          onChange={(val) => {
            setPriceRange(val);
            onFilterChange({ price_range: `${val[0]}_${val[1]}` });
          }}
          pearling
          minDistance={1}
          withTracks
          renderThumb={(props, state) => (
            <div {...props}>{state.valueNow}</div>
          )}
        />

      </div>


      <label><EditableField contentKey="content_307" defaultText="Filter by Location" /></label>
      <ul className="filter-list">
        {[...new Map(locationOptions.map(loc => [loc.location_name, loc])).values()].map((loc, idx) => (
          <li key={idx}>
            <input
              type="checkbox"
              checked={selectedLocations.includes(loc.location_name)}
              onChange={() => handleToggle('location_names', loc.location_name)}
            />
            {loc.location_name}
          </li>
        ))}
      </ul>


      {currentUser && savedFilters.length > 0 && (
        <div className="saved-filters">
          <label><EditableField contentKey="content_308" defaultText="Favorites" /></label>
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
            <EditableField contentKey="content_144" defaultText="❤ Save This Search" />
          </button>
        </div>
      )}
    </div>
  );
}
