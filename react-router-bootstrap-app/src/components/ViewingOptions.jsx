import { useState } from 'react';
import './ViewingOptions.css';
import EditableField from '../components/EditableField';
import { useUser } from '../context/UserContext';

export default function ViewingOptions({
  viewMode,
  onViewModeChange,
  itemsPerPage,
  onItemsPerPageChange,
  sortBy,
  onSortChange,
  sortDir,
  onSortDirChange,
  search,
  onClearSearch,
  collection = 'kits'  // default fallback
}) {
  const { currentUser } = useUser();

  const toggleSortDir = () => {
    onSortDirChange(sortDir === 'asc' ? 'desc' : 'asc');
  };

  const sortOptions = {
    kits: [
      { value: 'name', label: 'content_86' },         // Name
      { value: 'price', label: 'content_112' },       // Price
      { value: 'description', label: 'content_200' }, // Description
    ],
    orders: [
      { value: 'date', label: 'content_235' },        // Order Date
      { value: 'quantity', label: 'content_234' },    // Quantity
      { value: 'location', label: 'content_250' },    // Location Name
    ]
  }[collection] || [];

   return (
    <div className="viewing-options">
      <div className="option-group">
        <span className="label"><EditableField contentKey="content_79" /></span>
        <button className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => onViewModeChange('grid')}>
          <EditableField contentKey="content_80" />
        </button>
        <button className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => onViewModeChange('list')}>
          <EditableField contentKey="content_81" />
        </button>
      </div>

      <div className="option-group">
        <label htmlFor="items-per-page"><EditableField contentKey="content_82" /></label>
        <select
          id="items-per-page"
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
        >
          <option value={6}>6</option>
          <option value={12}><EditableField contentKey="content_83" plain /></option>
          <option value={24}><EditableField contentKey="content_84" plain /></option>
        </select>
      </div>

      <div className="option-group sort-group">
        <label htmlFor="sort-by"><EditableField contentKey="content_85" /></label>
        <select id="sort-by" value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
          {sortOptions.map(opt => (
            <option key={opt.value} value={opt.value}>
              <EditableField contentKey={opt.label} plain />
            </option>
          ))}
        </select>
        <button className="sort-dir-toggle" onClick={toggleSortDir} title="Toggle sort direction">
          {sortDir === 'asc' ? '▲' : '▼'}
        </button>
      </div>

      {search && (
        <div className="option-group">
          <button className="clear-search-btn" onClick={onClearSearch}>
            <EditableField contentKey="content_89" />
          </button>
        </div>
      )}
    </div>
  );
}

