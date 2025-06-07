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

  useEffect(() => {
    setSrc(content?.[contentKey] || alt);
  }, [contentKey, content]);

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
      await fetch(`${API_BASE}/api/update-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ field: contentKey, value: uploadData.url }),
      });

      setContent((prev) => {
        const updated = { ...prev, [contentKey]: uploadData.url };
        sessionStorage.setItem('content_cache', JSON.stringify(updated));
        sessionStorage.setItem('force_content_refetch', 'true');
        return updated;
      });
      setSrc(uploadData.url);
      window.location.reload();
    }
  };

  return (
    <div className="editable-image-wrapper">
      <img src={src} className={styles.thumbnail} />
      {fieldBelow && <div className="editable-below">{fieldBelow}</div>}
      {isAdmin && (
        <div>
          {!showUpload && (
            <button className="edit-icon" onClick={() => setShowUpload(true)}>
              Upload Image
            </button>
          )}
          {showUpload && (
            <span>
              <input type="file" accept="image/*" onChange={handleUpload} />
              <button className="editable-done" onClick={() => setShowUpload(false)}>
                Done
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
