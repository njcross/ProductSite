import React, { useState, useEffect, useContext } from 'react';
import { useUser } from '../context/UserContext';
import { ContentContext } from '../context/ContentContext';

export default function EditableImage({ contentKey }) {
  const { currentUser } = useUser();
  const { content, setContent } = useContext(ContentContext);
  const isAdmin = currentUser?.role === 'admin';
  const API_BASE = process.env.REACT_APP_API_URL;

  const [src, setSrc] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  // ✅ Load from context
  useEffect(() => {
    setSrc(content?.[contentKey] || '');
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
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ field: contentKey, value: uploadData.url }),
      });

      // ✅ Update context and sessionStorage
      setContent((prev) => {
        const updated = { ...prev, [contentKey]: uploadData.url };
        sessionStorage.setItem('content_cache', JSON.stringify(updated));
        sessionStorage.setItem('force_content_refetch', 'true'); // 👈 force fresh load on next refresh
        return updated;
      });
      setSrc(uploadData.url);
      window.location.reload();
    }
  };

  return (
    <div className="editable-image-wrapper">
      <img src={src} alt="Editable" style={{ maxWidth: '100%' }} />
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
