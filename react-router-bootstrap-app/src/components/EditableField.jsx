import React, { useState, useEffect, useContext } from 'react';
import { ContentContext } from '../context/ContentContext';
import { useUser } from '../context/UserContext';

export default function EditableField({ contentKey, plain = false, defaultText = '' }) {
  const { content, setContent } = useContext(ContentContext);
  const { currentUser } = useUser();

  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(content?.[contentKey] || '');
  const [newValue, setNewValue] = useState('');
  const API_BASE = process.env.REACT_APP_API_URL;

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    setText(content?.[contentKey] || defaultText);
  }, [contentKey, content]);

  const saveContent = async () => {
    const res = await fetch(`${API_BASE}/api/update-content`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ field: contentKey, value: newValue }),
    });

    if (res.ok) {
      setText(newValue);
      setContent((prev) => {
        const updated = { ...prev, [contentKey]: newValue };
        sessionStorage.setItem('content_cache', JSON.stringify(updated));
        sessionStorage.setItem('force_content_refetch', 'true');
        return updated;
      });
      window.location.reload();
    }
  };

  if (plain) return text;

  return (
    <span className="editable-wrapper">
      {editing ? (
        <span>
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onBlur={() => {
              if (newValue.trim() === '' || newValue === text) {
                setEditing(false);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setEditing(false);
              } else if (e.key === 'Enter') {
                e.preventDefault();
                if (newValue !== text) {
                  saveContent();
                }
              }
            }}
            autoFocus
          />
          {(newValue !== text) && (
            <button onClick={saveContent} className="editable-done">
              Done
            </button>
          )}
        </span>
      ) : (
        <span>
          {text}
          {isAdmin && (
            <span
              onClick={(e) => {
                e.preventDefault();
                setNewValue(text);
                setEditing(true);
              }}
              className="edit-icon"
              style={{ cursor: 'pointer', marginLeft: '4px' }}
              title="Edit"
            >
              ✏️
            </span>
          )}
        </span>
      )}
    </span>
  );
}
