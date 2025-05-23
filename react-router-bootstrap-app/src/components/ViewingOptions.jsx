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
  collection
}) {
  const { currentUser } = useUser();

  const toggleSortDir = () => {
    onSortDirChange(sortDir === 'asc' ? 'desc' : 'asc');
  };
  useEffect(() => {
    localStorage.setItem('viewingOptions' + collection, JSON.stringify({
      view: filters.view,
      itemsPerPage: filters.itemsPerPage,
      sortBy: filters.sortBy,
      sortDir: filters.sortDir
    }));
  }, [filters.view, filters.itemsPerPage, filters.sortBy, filters.sortDir]);

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
          <option value="name"><EditableField contentKey="content_86" plain /></option>
          <option value="price"><EditableField contentKey="content_112" plain /></option>
          <option value="description"><EditableField contentKey="content_200" plain /></option>
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
