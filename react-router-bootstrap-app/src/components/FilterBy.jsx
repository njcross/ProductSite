import './FilterBy.css';
import EditableField from '../components/EditableField';

export default function FilterBy({ 
  selectedAlignment, 
  onFilterChange, 
  savedFilters = [], 
  onSelectSavedFilter, 
  onDeleteSavedFilter, 
  currentUser 
}) {

  return (
    <div className="filter-by">
      <label><EditableField contentKey="content_32" /></label>

      <select value={selectedAlignment} onChange={e => onFilterChange(e.target.value)}>
        <option value="">
          <EditableField contentKey="content_33" plain />
        </option>
        <option value="hero">
          <EditableField contentKey="content_6" plain />
        </option>
        <option value="villain">
          <EditableField contentKey="content_7" plain />
        </option>
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
          {/* (Optional) Add a Delete button next to each saved filter */}
        </div>
      )}
    </div>
  );
}
