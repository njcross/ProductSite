import React from 'react';
import './PaginationControls.css';

export default function PaginationControls({ page, onPageChange, hasNext }) {
  return (
    <div className="pagination-controls">
      {page > 1 && (
        <button className="page-btn" onClick={() => onPageChange(page - 1)}>
          ← Previous
        </button>
      )}

      <span className="page-number">Page {page}</span>

      {hasNext && (
        <button className="page-btn" onClick={() => onPageChange(page + 1)}>
          Next →
        </button>
      )}
    </div>
  );
}
