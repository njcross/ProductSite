import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';

export default function EditableField({ contentKey }) {
  const [content, setContent] = useState('');
  const [editing, setEditing] = useState(false);
  const [newValue, setNewValue] = useState('');

  const API_BASE = process.env.REACT_APP_API_URL;

  const { currentUser } = useUser();
      const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    fetch('/content.json', {
        credentials: 'include',
      headers: { 'X-Admin': 'true',
        'ngrok-skip-browser-warning': 'true',
        credentials: 'include'
       },
    })
      .then(res => res.json())
      .then(data => setContent(data[contentKey] || ''));
  }, [contentKey]);

  const saveContent = async () => {
    const res = await fetch(`${API_BASE}/api/update-content`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin': 'true',
        'ngrok-skip-browser-warning': 'true',
        credentials: 'include'
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
        <span>
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            autoFocus
          />
          <button onClick={saveContent} className="editable-done">Done</button>
        </span>
      ) : (
        <span onClick={() => isAdmin && (setNewValue(content), setEditing(true))}>
          {content} {isAdmin && <span className="edit-icon">✏️</span>}
        </span>
      )}
    </span>
  );
}