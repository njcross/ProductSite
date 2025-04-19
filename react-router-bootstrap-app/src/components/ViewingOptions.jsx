import './ViewingOptions.css';

export default function ViewingOptions({ viewMode, onViewModeChange }) {
  return (
    <div className="viewing-options">
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
  );
}
