// src/components/PaginationControls.jsx
import './PaginationControls.css';

export default function PaginationControls({ page, onPageChange, hasNext }) {
  return (
    <div className="pagination-controls">
      <button
        className="page-btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        ← Previous
      </button>
      <span className="page-number">Page {page}</span>
      <button
        className="page-btn"
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNext}
      >
        Next →
      </button>
    </div>
  );
}
