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
        // ✅ Update sessionStorage
        sessionStorage.setItem('content_cache', JSON.stringify(updated));
        return updated;
      });
      setEditing(false);
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
            autoFocus
          />
          <button
          onClick={saveContent}
          className="editable-done"
          disabled={newValue.trim() === '' || newValue === text}
        >
          Done
        </button>
        </span>
      ) : (
        <span
          onClick={() => {
            if (isAdmin) {
              setNewValue(text);
              setEditing(true);
            }
          }}
        >
          {text} {isAdmin && <span className="edit-icon">✏️</span>}
        </span>
      )}
    </span>
  );
}
