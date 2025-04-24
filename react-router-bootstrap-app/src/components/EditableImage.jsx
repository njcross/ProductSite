// EditableImage.jsx
import React, { useState, useEffect } from 'react';

export default function EditableImage({ contentKey }) {
  const [src, setSrc] = useState('');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  useEffect(() => {
    fetch('/content.json')
      .then(res => res.json())
      .then(data => setSrc(data[contentKey] || ''));
  }, [contentKey]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);

    const uploadRes = await fetch('/api/upload-image', {
      method: 'POST',
      headers: { 'X-Admin': 'true' },
      body: formData
    });

    const uploadData = await uploadRes.json();
    if (uploadData.url) {
      await fetch('/api/update-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin': 'true'
        },
        body: JSON.stringify({ field: contentKey, value: uploadData.url })
      });
      setSrc(uploadData.url);
    }
  };

  return (
    <div className="editable-image-wrapper">
      <img src={src} alt="Editable" style={{ maxWidth: '100%' }} />
      {isAdmin && (
        <label className="upload-icon">
          📷
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
        </label>
      )}
    </div>
  );
}