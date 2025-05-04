import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import EditableField from '../components/EditableField';
import { Helmet } from 'react-helmet';
import './UserSettings.css';

export default function UserSettings() {
  const { currentUser } = useUser();
  const API_BASE = process.env.REACT_APP_API_URL;

  const [email, setEmail] = useState(currentUser?.email || '');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleChangeEmail = async () => {
    if (!password) return setMessage('Please enter your password to change email.');
    try {
      await fetch(`${API_BASE}/api/change-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          credentials: 'include'
        },
        body: JSON.stringify({ email, password })
      });
      setMessage('Email updated successfully!');
    } catch {
      setMessage('Failed to update email.');
    }
  };

  const handleChangePassword = async () => {
    if (!password || !newPassword) return setMessage('Please fill in both password fields.');
    try {
      await fetch(`${API_BASE}/api/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          credentials: 'include'
        },
        body: JSON.stringify({ currentPassword: password, newPassword })
      });
      setMessage('Password updated successfully!');
    } catch {
      setMessage('Failed to update password.');
    }
  };

  return (
    <div className="user-settings-container">
      <Helmet>
        <title>Account Settings – Play Trays</title>
        <meta name="description" content="Update your profile, email, and password securely." />
      </Helmet>
      <h2><EditableField contentKey="settings_1" /> {/* "Account Settings" */}</h2>
      <div className="settings-group">
        <label><EditableField contentKey="settings_2" /> {/* "Email" */}</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label><EditableField contentKey="settings_3" /> {/* "Current Password" */}</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={handleChangeEmail}><EditableField contentKey="settings_4" /> {/* "Update Email" */}</button>
      </div>

      <div className="settings-group">
        <label><EditableField contentKey="settings_5" /> {/* "New Password" */}</label>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <label><EditableField contentKey="settings_3" /> {/* "Current Password" */}</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={handleChangePassword}><EditableField contentKey="settings_6" /> {/* "Update Password" */}</button>
      </div>
      {message && <p className="status-message">{message}</p>}
    </div>
  );
}
