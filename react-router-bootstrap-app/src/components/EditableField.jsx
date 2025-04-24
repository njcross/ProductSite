// EditableField.jsx
import React, { useState, useEffect } from 'react';

export default function EditableField({ contentKey }) {
  const [content, setContent] = useState('');
  const [editing, setEditing] = useState(false);
  const [newValue, setNewValue] = useState('');

  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  useEffect(() => {
    fetch('/content.json')
      .then(res => res.json())
      .then(data => setContent(data[contentKey] || ''));
  }, [contentKey]);

  const saveContent = async () => {
    const res = await fetch('/api/update-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin': 'true'
      },
      body: JSON.stringify({ field: contentKey, value: newValue })
    });

    if (res.ok) {
      setContent(newValue);
      setEditing(false);
    }
  };

  return (
    <span className="editable-wrapper">
      {editing ? (
        <input
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onBlur={saveContent}
          autoFocus
        />
      ) : (
        <span onClick={() => isAdmin && (setNewValue(content), setEditing(true))}>
          {content} {isAdmin && <span className="edit-icon">✏️</span>}
        </span>
      )}
    </span>
  );
}