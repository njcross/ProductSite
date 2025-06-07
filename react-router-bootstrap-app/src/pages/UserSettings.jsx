import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import EditableField from '../components/EditableField';
import { Helmet } from 'react-helmet-async';
import './UserSettings.css';

export default function UserSettings() {
  const { currentUser } = useUser();
  const API_BASE = process.env.REACT_APP_API_URL;

  const [email, setEmail] = useState(currentUser?.email || '');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [viewAll, setViewAll] = useState(false);

  useEffect(() => {
    if (currentUser?.role === 'admin' && viewAll) {
      fetch(`${API_BASE}/api/users`, { credentials: 'include' })
        .then(res => res.json())
        .then(setAllUsers)
        .catch(() => setMessage('Failed to load users.'));
    }
  }, [viewAll, currentUser, API_BASE]);

  const handleChangeEmail = async () => {
    if (!password) return setMessage('Please enter your password to change email.');
    try {
      await fetch(`${API_BASE}/api/change-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword: password, newPassword })
      });
      setMessage('Password updated successfully!');
    } catch {
      setMessage('Failed to update password.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!password) return setMessage('Please enter your password.');
    const confirmed = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (!confirmed) return;
    try {
      await fetch(`${API_BASE}/api/delete-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        credentials: 'include'
      });
      setMessage('Account deleted successfully!');
      navigate('/login');
    } catch {
      setMessage('Failed to delete account.');
    }
  };

  const handleDeleteUser = async (id) => {
    const confirmed = window.confirm('Delete this user?');
    if (!confirmed) return;
    try {
      await fetch(`${API_BASE}/api/users/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      setAllUsers(allUsers.filter(u => u.id !== id));
    } catch {
      setMessage('Failed to delete user.');
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await fetch(`${API_BASE}/api/users/${id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role })
      });
      setAllUsers(allUsers.map(u => u.id === id ? { ...u, role } : u));
    } catch {
      setMessage('Failed to update role.');
    }
  };

  return (
    <div className="user-settings-container">
      <Helmet>
        <title>Account Settings – My Play Trays</title>
        <meta name="description" content="Update your profile, email, and password securely." />
      </Helmet>
      <h2><EditableField contentKey="settings_1" /></h2>

      {currentUser?.role === 'admin' && (
        <button className="toggle-view-btn" onClick={() => setViewAll(!viewAll)}>
          {viewAll ? 'View My Settings' : 'View All Users'}
        </button>
      )}

      {!viewAll && (
        <>
          <div className="settings-group">
            <h3><EditableField contentKey="content_242" /></h3>
            <label><EditableField contentKey="settings_2" /></label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <label><EditableField contentKey="settings_3" /></label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleChangeEmail}><EditableField contentKey="settings_4" /></button>
          </div>

          <div className="settings-group">
            <h3><EditableField contentKey="content_243" /></h3>
            <label><EditableField contentKey="settings_5" /></label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <label><EditableField contentKey="settings_3" /></label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleChangePassword}><EditableField contentKey="settings_6" /></button>
          </div>

          <div className="settings-group">
            <h3><EditableField contentKey="content_244" /></h3>
            <label><EditableField contentKey="settings_3" /></label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleDeleteAccount}><EditableField contentKey="content_241" /></button>
          </div>
        </>
      )}

      {viewAll && (
        <div className="all-users-list">
          <h3>All Registered Users</h3>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.email}</td>
                  <td>{user.username}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>{user.active ? 'Active' : 'Inactive'}</td>
                  <td>
                    <button onClick={() => handleDeleteUser(user.id)} className="danger-btn">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {message && <p className="status-message">{message}</p>}
    </div>
  );
}
