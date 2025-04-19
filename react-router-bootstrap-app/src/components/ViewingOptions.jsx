import './ViewingOptions.css';

export default function ViewingOptions({
  viewMode,
  onViewModeChange,
  itemsPerPage,
  onItemsPerPageChange,
  sortBy,
  onSortChange
}) {
  return (
    <div className="viewing-options">
      <div className="option-group">
        <span className="label">View Mode:</span>
        <button
          className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
          onClick={() => onViewModeChange('grid')}
        >
          🟦 Grid
        </button>
        <button
          className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => onViewModeChange('list')}
        >
          📄 List
        </button>
      </div>

      <div className="option-group">
        <label htmlFor="items-per-page">Products per page:</label>
        <select
          id="items-per-page"
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
        >
          <option value={6}>6</option>
          <option value={12}>12</option>
          <option value={24}>24</option>
        </select>
      </div>

      <div className="option-group">
        <label htmlFor="sort-by">Sort by:</label>
        <select
          id="sort-by"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="name">Name (A-Z)</option>
          <option value="alias">Alias</option>
          <option value="alignment">Alignment</option>
        </select>
      </div>
    </div>
  );
}
