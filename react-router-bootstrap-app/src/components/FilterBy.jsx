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
  collection = 'kits',
  initialSelectedRatings = '',
  priceRangeOverride = null,
  showUserFilter = false,
}) {
  const API_BASE = process.env.REACT_APP_API_URL;
  const [ageOptions, setAgeOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [themeOptions, setThemeOptions] = useState([]);
  const [gradeOptions, setGradeOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [kitOptions, setKitOptions] = useState([]);

  const [selectedRating, setSelectedRating] = useState(initialSelectedRatings);
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState([]);
  const [updatedSelectedLocations, setSelectedLocations] = useState([]);
  const [quantityRange, setQuantityRange] = useState([]);
  const [selectedKitIds, setSelectedKitIds] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  // track currently selected saved filter (for delete "×")
  const [activeSavedId, setActiveSavedId] = useState('');

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
    fetch(`${API_BASE}/api/kits`).then(res => res.json()).then(setKitOptions).catch(console.error);

    if (collection === 'orders' && showUserFilter) {
      fetch(`${API_BASE}/api/users`, { method: 'GET', credentials: 'include' })
        .then(res => res.json())
        .then(setUsers)
        .catch(console.error);
    }

    const saved = localStorage.getItem(localKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      setSelectedRating(parsed.rating || '');
      if (parsed.price_range && Array.isArray(parsed.price_range)) {
        setPriceRange(parsed.price_range);
      }
      if (parsed.kit_ids) setSelectedKitIds(parsed.kit_ids);
      if (parsed.location_names) setSelectedLocations(parsed.location_names);
      if (parsed.shipping_type) setSelectedShipping(parsed.shipping_type);
      if (parsed.status) setSelectedStatuses(parsed.status);
      if (parsed.payment_method) setSelectedPaymentMethods(parsed.payment_method);
      if (parsed.user_ids) setSelectedUserIds(parsed.user_ids);
      onFilterChange(parsed);
    }
  }, [API_BASE, collection, collection, showUserFilter]); // (dup collection in deps preserved from your code)

  useEffect(() => {
    const filtersToSave = {};

    if (collection === 'cards' || collection === 'orders') {
      filtersToSave.age_ids = selectedAges;
      filtersToSave.category_ids = selectedCategories;
      filtersToSave.theme_ids = selectedThemes;
      filtersToSave.grade_ids = selectedGrades;
      filtersToSave.rating = selectedRating;
      filtersToSave.location_names = updatedSelectedLocations;
      filtersToSave.shipping_type = selectedShipping;
      filtersToSave.status = selectedStatuses;
      filtersToSave.payment_method = selectedPaymentMethods;
      filtersToSave.user_ids = selectedUserIds;
    }

    if (collection === 'kits') {
      filtersToSave.age_ids = selectedAges;
      filtersToSave.category_ids = selectedCategories;
      filtersToSave.theme_ids = selectedThemes;
      filtersToSave.grade_ids = selectedGrades;
      filtersToSave.rating = selectedRating;
      filtersToSave.price_range = priceRange;
      filtersToSave.location_names = updatedSelectedLocations;
    }

    if (collection === 'inventory') {
      filtersToSave.rating = selectedRating;
      filtersToSave.location_names = updatedSelectedLocations;
      filtersToSave.quantityRange = quantityRange;
      filtersToSave.kit_ids = selectedKitIds;
    }

    localStorage.setItem(localKey, JSON.stringify(filtersToSave));
  }, [
    collection,
    selectedAges,
    selectedCategories,
    selectedThemes,
    selectedGrades,
    updatedSelectedLocations,
    selectedRating,
    priceRange,
    quantityRange,
    selectedKitIds
  ]);

  const handleToggle = (type, id) => {
    const currentSelections = {
      age_ids: selectedAges,
      category_ids: selectedCategories,
      theme_ids: selectedThemes,
      grade_ids: selectedGrades,
      location_names: updatedSelectedLocations,
      status: selectedStatuses,
      payment_method: selectedPaymentMethods,
      shipping_type: selectedShipping,
      kit_ids: selectedKitIds,
      user_ids: selectedUserIds,
    }[type] || [];

    const idStr = String(id);
    const norm = currentSelections.map(String);
    const nextStr = norm.includes(idStr)
      ? norm.filter(v => v !== idStr)
      : [...norm, idStr];

    const next = currentSelections.some(v => typeof v === 'number')
      ? nextStr.map(Number)
      : nextStr;

    if (type === 'kit_ids') setSelectedKitIds(next);
    if (type === 'location_names') setSelectedLocations(next);
    if (type === 'shipping_type') setSelectedShipping(next);
    if (type === 'status') setSelectedStatuses(next);
    if (type === 'payment_method') setSelectedPaymentMethods(next);
    if (type === 'user_ids') setSelectedUserIds(next);

    onFilterChange({ [type]: next });
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
      {collection === 'kits' && (
        <>
          <label><EditableField contentKey="content_301" defaultText="Filter by Age" /></label>
          <ul className="filter-list">
            {ageOptions.map(age => (
              <li key={age.id}>
                <input
                  type="checkbox"
                  checked={selectedAges.some(v => String(v) === String(age.id))}
                  onChange={() => handleToggle('age_ids', String(age.id))}
                />
                {age.name}
              </li>
            ))}
          </ul>
        </>
      )}

      {collection === 'orders' && showUserFilter && (
        <>
          <label><EditableField contentKey="content_323" defaultText="Filter by User" /></label>
          <ul className="filter-list">
            {users.map(user => (
              <li key={user.id}>
                <input
                  type="checkbox"
                  checked={selectedUserIds.some(v => String(v) === String(user.id))}
                  onChange={() => handleToggle('user_ids', String(user.id))}
                />
                {user.username}
              </li>
            ))}
          </ul>
        </>
      )}

      {['kits', 'orders'].includes(collection) && (
        <>
          <label><EditableField contentKey="content_302" defaultText="Filter by Category" /></label>
          <ul className="filter-list">
            {categoryOptions.map(cat => (
              <li key={cat.id}>
                <input
                  type="checkbox"
                  checked={selectedCategories.some(v => String(v) === String(cat.id))}
                  onChange={() => handleToggle('category_ids', String(cat.id))}
                />
                {cat.name}
              </li>
            ))}
          </ul>
        </>
      )}

      {collection === 'kits' && (
        <>
          <label><EditableField contentKey="content_303" defaultText="Filter by Theme" /></label>
          <ul className="filter-list">
            {themeOptions.map(theme => (
              <li key={theme.id}>
                <input
                  type="checkbox"
                  checked={selectedThemes.some(v => String(v) === String(theme.id))}
                  onChange={() => handleToggle('theme_ids', String(theme.id))}
                />
                {theme.name}
              </li>
            ))}
          </ul>
        </>
      )}

      {collection === 'kits' && (
        <>
          <label><EditableField contentKey="content_304" defaultText="Filter by Grade" /></label>
          <ul className="filter-list">
            {gradeOptions.map(grade => (
              <li key={grade.id}>
                <input
                  type="checkbox"
                  checked={selectedGrades.some(v => String(v) === String(grade.id))}
                  onChange={() => handleToggle('grade_ids', String(grade.id))}
                />
                {grade.name}
              </li>
            ))}
          </ul>
        </>
      )}

      {collection === 'kits' && (
        <>
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
        </>
      )}

      {collection === 'kits' && (
        <>
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
        </>
      )}

      <label><EditableField contentKey="content_307" defaultText="Filter by Location" /></label>
      <ul className="filter-list">
        {[...new Map(locationOptions.map(loc => [loc.location_name, loc])).values()].map((loc, idx) => (
          <li key={idx}>
            <input
              type="checkbox"
              checked={updatedSelectedLocations.includes(loc.location_name)}
              onChange={() => handleToggle('location_names', loc.location_name)}
            />
            {loc.location_name}
          </li>
        ))}
      </ul>

      {collection === 'orders' && (
        <>
          <label><EditableField contentKey="content_320" defaultText="Filter by Status" /></label>
          <ul className="filter-list">
            {['Pending', 'Ready for pickup', 'Shipped', 'Returned'].map((status, i) => (
              <li key={i}>
                <input
                  type="checkbox"
                  checked={selectedStatuses.includes(status)}
                  onChange={() => handleToggle('status', status)}
                />
                {status}
              </li>
            ))}
          </ul>

          <label><EditableField contentKey="content_321" defaultText="Filter by Payment Method" /></label>
          <ul className="filter-list">
            {['stripe', 'admin'].map((method, i) => (
              <li key={i}>
                <input
                  type="checkbox"
                  checked={selectedPaymentMethods.includes(method)}
                  onChange={() => handleToggle('payment_method', method)}
                />
                {method}
              </li>
            ))}
          </ul>

          <label><EditableField contentKey="content_322" defaultText="Filter by Shipping Type" /></label>
          <ul className="filter-list">
            {['pickup', 'delivery'].map((type, i) => (
              <li key={i}>
                <input
                  type="checkbox"
                  checked={selectedShipping.includes(type)}
                  onChange={() => handleToggle('shipping_type', type)}
                />
                {type}
              </li>
            ))}
          </ul>
        </>
      )}

      {collection === 'inventory' && (
        <>
          <label><EditableField contentKey="content_330" defaultText="Filter by Kit" /></label>
          <ul className="filter-list">
            {kitOptions.map(kit => (
              <li key={kit.id}>
                <input
                  type="checkbox"
                  checked={selectedKitIds.includes(String(kit.id))}
                  onChange={() => handleToggle('kit_ids', String(kit.id))}
                />
                {kit.name}
              </li>
            ))}
          </ul>

          <label><EditableField contentKey="content_331" defaultText="Filter by Quantity Range" /></label>
          <ReactSlider
            className="price-slider"
            thumbClassName="slider-thumb"
            trackClassName="slider-track"
            min={0}
            max={100}
            value={quantityRange}
            onChange={(val) => {
              setQuantityRange(val);
              onFilterChange({ quantity_range: `${val[0]}_${val[1]}` });
            }}
            pearling
            minDistance={1}
            withTracks
            renderThumb={(props, state) => (
              <div {...props}>{state.valueNow}</div>
            )}
          />
        </>
      )}

      {currentUser && collection === 'kits' && (
        <div className="favorite-filters">
          {savedFilters.length > 0 && (
            <div className="saved-filters">
              <label><EditableField contentKey="content_308" defaultText="Favorites" /></label>
              <div className="saved-filters-row">
                <select
                  value={activeSavedId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setActiveSavedId(id);
                    if (id) onSelectSavedFilter(id);
                  }}
                >
                  <option value="">Select a Saved Filter</option>
                  {savedFilters.map((filter) => (
                    <option key={filter.id} value={filter.id}>{filter.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="delete-saved-filter"
                  title="Delete selected saved filter"
                  aria-label="Delete selected saved filter"
                  disabled={!activeSavedId}
                  onClick={() => {
                    if (!activeSavedId) return;
                    const f = savedFilters.find(s => String(s.id) === String(activeSavedId));
                    const label = f?.name || 'this saved filter';
                    if (window.confirm(`Delete "${label}"?`)) {
                      onDeleteSavedFilter(activeSavedId);
                      setActiveSavedId('');
                    }
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <div className="option-group">
            <button className="save-filter-btn" onClick={onSaveFilter}>
              <EditableField contentKey="content_144" defaultText="❤ Save This Search" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
