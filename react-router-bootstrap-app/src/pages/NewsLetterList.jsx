import React, { useState } from 'react';
import EditableField from '../components/EditableField';
import { useUser } from '../context/UserContext';
import { Helmet } from 'react-helmet';
import './NewsletterList.css'; 

export default function NewsLetterList() {
  const [value, setValue] = useState('1');
  const [emails, setEmails] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { currentUser } = useUser();
  const API_BASE = process.env.REACT_APP_API_URL;

  const fetchEmails = async () => {
    if (!/^\d+$/.test(value)) {
      setError("Please enter a valid integer.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/newsletter/list?value=${value}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          credentials: 'include'
        },
      });
      const data = await res.json();
      if (res.ok) {
        setEmails(data);
        setError('');
      } else {
        setError(data.error || 'Failed to fetch.');
      }
    } catch (err) {
      setError('Server error.');
    }
  };

  const handleDelete = async (email) => {
    try {
      const res = await fetch(`${API_BASE}/api/newsletter/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          credentials: 'include'
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmails((prev) => prev.filter((e) => e !== email));
        setMessage(`Unsubscribed ${email}`);
      } else {
        setError(data.error || 'Failed to unsubscribe.');
      }
    } catch (err) {
      setError('Server error.');
    }
  };

  return (
    <div className="newsletter-page">
      <Helmet>
              <title>Newsletter Signups</title>
              <meta name="description" content="View and manage newsletter subscribers. Admin Only" />
            </Helmet>
      {currentUser?.role === 'admin' && (
      <div className="newsletter-form">
        <h1><EditableField contentKey="newsletter_title" defaultText="Newsletter Email List" /></h1>
        
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter newsletter number"
          aria-label="Newsletter value"
          pre-f
        />
        
        <button onClick={fetchEmails} className="newsletter-form-fetch">
          <EditableField contentKey="newsletter_fetch_button" defaultText="Fetch Emails" />
        </button>

        {error && <div className="text-danger mt-2">{error}</div>}
        {message && <div className="text-success mt-2">{message}</div>}

        {emails.length > 0 ? (
          <ul className="newsletter-result mt-3">
            {emails.map((email) => (
              <li key={email}>
                {email}
                <button
                  className="icon-btn newsletter-form-delete"
                  onClick={() => handleDelete(email)}
                  title="Unsubscribe"
                >
                  <i className="bi bi-trash-fill trash"></i>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-3">
            <EditableField contentKey="newsletter_empty_state" defaultText="No emails loaded yet." />
          </div>
        )}
      </div>) } 
    </div>
  );
}
