import React, { useState, useEffect, useContext } from 'react';
import { ContentContext } from '../context/ContentContext';
import { useUser } from '../context/UserContext';

export default function EditableField({ contentKey, plain = false }) {
  const { content, setContent } = useContext(ContentContext);
  const { currentUser } = useUser();

  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(content?.[contentKey] || '');
  const [newValue, setNewValue] = useState('');
  const API_BASE = process.env.REACT_APP_API_URL;

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (!content?.[contentKey]) {
      fetch('/content.json', {
        credentials: 'include',
        headers: {
          'X-Admin': 'true',
          'ngrok-skip-browser-warning': 'true',
        },
      })
        .then(res => res.json())
        .then(data => {
          setText(data[contentKey] || '');
        })
        .catch(() => setText(''));
    } else {
      setText(content[contentKey]);
    }
  }, [contentKey, content]);

  const saveContent = async () => {
    const res = await fetch(`${API_BASE}/api/update-content`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin': 'true',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ field: contentKey, value: newValue }),
    });

    if (res.ok) {
      setText(newValue);
      setContent((prev) => ({ ...prev, [contentKey]: newValue }));
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
          <button onClick={saveContent} className="editable-done">Done</button>
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
