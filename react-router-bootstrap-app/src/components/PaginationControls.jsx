import React from 'react';
import EditableField from '../components/EditableField';
import './PaginationControls.css';

export default function PaginationControls({ page, onPageChange, hasNext }) {
  return (
    <div className="pagination-controls">
      {page > 1 && (
        <>
          <button className="page-btn" onClick={() => onPageChange(page - 1)}>
            <EditableField contentKey="content_70" />
          </button>
        </>
      )}

      <span className="page-number">
        <EditableField contentKey="content_72" /> {page}
      </span>
   

      {hasNext && (
        <>
          <button className="page-btn" onClick={() => onPageChange(page + 1)}>
            <EditableField contentKey="content_73" />
          </button>
        </>
      )}
    </div>
  );
}
