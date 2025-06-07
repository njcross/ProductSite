import React, { useState, useEffect, useContext } from 'react';
import { useUser } from '../context/UserContext';
import { ContentContext } from '../context/ContentContext';
import styles from '../styles/global.module.css';

export default function EditableImage({ contentKey, alt, fieldBelow = null }) {
  const { currentUser } = useUser();
  const { content, setContent } = useContext(ContentContext);
  const isAdmin = currentUser?.role === 'admin';
  const API_BASE = process.env.REACT_APP_API_URL;

  const [src, setSrc] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    setSrc(content?.[contentKey] || alt);
  }, [contentKey, content]);

  // Fetch list of existing images from backend
  useEffect(() => {
    if (showUpload && isAdmin) {
      fetch(`${API_BASE}/api/images`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
        .then(res => res.json())
        .then(data => setExistingImages(data))
        .catch(err => console.error('Failed to fetch existing images', err));
    }
  }, [showUpload, isAdmin]);

  const updateImage = async (url) => {
    await fetch(`${API_BASE}/api/update-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ field: contentKey, value: url }),
    });

    setContent(prev => {
      const updated = { ...prev, [contentKey]: url };
      sessionStorage.setItem('content_cache', JSON.stringify(updated));
      sessionStorage.setItem('force_content_refetch', 'true');
      return updated;
    });

    setSrc(url);
    window.location.reload();
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);

    const uploadRes = await fetch(`${API_BASE}/api/upload-image`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    const uploadData = await uploadRes.json();
    if (uploadData.url) {
      await updateImage(uploadData.url);
    }
  };

  return (
    <div className="editable-image-wrapper">
      <img
        src={src}
        className={fieldBelow ? styles.thumbnail : undefined}
      />

      {fieldBelow && <div className="editable-below">{fieldBelow}</div>}

      {isAdmin && (
        <div>
          {!showUpload && (
            <button className="edit-icon" onClick={() => setShowUpload(true)}>
              Upload Image
            </button>
          )}

          {showUpload && (
            <div>
              <label style={{ fontWeight: 'bold' }}>Upload New:</label>
              <input type="file" accept="image/*" onChange={handleUpload} />
              <hr />
              <label style={{ fontWeight: 'bold' }}>Select from Existing:</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {existingImages.map((imgUrl, index) => (
                  <img
                    key={index}
                    src={imgUrl}
                    alt="existing option"
                    onClick={() => updateImage(imgUrl)}
                    style={{
                      width: '100px',
                      height: '100px',
                      objectFit: 'cover',
                      border: imgUrl === src ? '3px solid var(--color-accent)' : '1px solid #ccc',
                      cursor: 'pointer',
                      borderRadius: '8px',
                    }}
                  />
                ))}
              </div>
              <button className="editable-done" onClick={() => setShowUpload(false)}>
                Done
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
