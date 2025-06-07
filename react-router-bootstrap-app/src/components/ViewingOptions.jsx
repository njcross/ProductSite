import './ViewingOptions.css';
import EditableField from '../components/EditableField';
import { useUser } from '../context/UserContext';
import { useEffect } from 'react';

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
  collection = 'kits'
}) {
  const { currentUser } = useUser();
 
  useEffect(() => {
    const saved = localStorage.getItem(`viewing_options_${collection}`);
    if (saved) {
      const options = JSON.parse(saved);
      if (options.viewMode) onViewModeChange(options.viewMode);
      if (options.itemsPerPage) onItemsPerPageChange(options.itemsPerPage);
      if (options.sortBy) onSortChange(options.sortBy);
      if (options.sortDir) onSortDirChange(options.sortDir);
    }
  }, [collection]);

  useEffect(() => {
    localStorage.setItem(
      `viewing_options_${collection}`,
      JSON.stringify({
        viewMode,
        itemsPerPage,
        sortBy,
        sortDir,
      })
    );
  }, [viewMode, itemsPerPage, sortBy, sortDir, collection]);

  const toggleSortDir = () => {
    onSortDirChange(sortDir === 'asc' ? 'desc' : 'asc');
  };

  const sortOptions = {
    kits: [
      { value: 'name', label: 'content_86' },           // Name (A-Z)
      { value: 'price', label: 'content_112' },         // Price
      { value: 'average_rating', label: 'content_219' },// Rating
      { value: 'description', label: 'content_200' },   // Description
    ],
    orders: [
      { value: 'time_bought', label: 'content_235' },    // Date Purchased
      { value: 'quantity', label: 'content_234' },      // Quantity
      { value: 'location_name', label: 'content_250' }, // Location
      { value: 'name', label: 'content_232' },          // Kit Name
      { value: 'average_rating', label: 'content_219' },// Rating
      { value: 'price', label: 'content_112' },         // Price
    ],
    inventory: [
      { value: 'quantity', label: 'content_234' },      // Quantity
      { value: 'location_name', label: 'content_250' }, // Location
      { value: 'name', label: 'content_232' },          // Kit Name
      { value: 'average_rating', label: 'content_219' },// Rating
      { value: 'price', label: 'content_112' },         // Price
    ]
  }[collection] || [];

  return (
    <div className="viewing-options">
      {collection === 'kits' && (
        <div className="option-group">
          <span className="label"><EditableField contentKey="content_79" /></span>
          <button
            className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => onViewModeChange('grid')}
          >
            <EditableField contentKey="content_80" />
          </button>
          <button
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => onViewModeChange('list')}
          >
            <EditableField contentKey="content_81" />
          </button>
        </div>
      )}

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
