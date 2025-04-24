import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext'; // Assuming you have a custom hook to get user info

export default function EditableImage({ contentKey }) {
  const [src, setSrc] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const { currentUser } = useUser();
    const isAdmin = currentUser?.role === 'admin';
    const API_BASE = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetch('/content.json')
      .then(res => res.json())
      .then(data => setSrc(data[contentKey] || ''));
  }, [contentKey]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);

    const uploadRes = await fetch(`${API_BASE}/api/upload-image`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-Admin': 'true',
        'ngrok-skip-browser-warning': 'true',
        credentials: 'include'
       },
      
      body: formData
    });

    const uploadData = await uploadRes.json();
    if (uploadData.url) {
      await fetch(`${API_BASE}/api/update-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin': 'true',
          'ngrok-skip-browser-warning': 'true',
            credentials: 'include'
        },
        credentials: 'include',
        body: JSON.stringify({ field: contentKey, value: uploadData.url })
      });
      setSrc(uploadData.url);
      setShowUpload(false);
    }
  };

  return (
    <div className="editable-image-wrapper">
      <img src={src} alt="Editable" style={{ maxWidth: '100%' }} />
      {isAdmin && (
        <div>
          {!showUpload && (
            <button className="edit-icon" onClick={() => setShowUpload(true)}>📷</button>
          )}
          {showUpload && (
            <span>
              <input type="file" accept="image/*" onChange={handleUpload} />
              <button className="editable-done" onClick={() => setShowUpload(false)}>Done</button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}