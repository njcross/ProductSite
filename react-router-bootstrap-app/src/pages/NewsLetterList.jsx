import React, { useState, useEffect } from 'react';
import EditableField from '../components/EditableField';
import { useUser } from '../context/UserContext';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './NewsletterList.css';

export default function NewsLetterList() {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const API_BASE = process.env.REACT_APP_API_URL;

  const [newsletterValue, setNewsletterValue] = useState('');
  const [availableLists, setAvailableLists] = useState([]);
  const [emails, setEmails] = useState([]);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [savedMessages, setSavedMessages] = useState([]);

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      navigate('/');
      return;
    }

    fetch(`${API_BASE}/api/newsletter/available-values`, { credentials: 'include' })
      .then(res => res.json())
      .then(setAvailableLists)
      .catch(console.error);

    fetchSavedMessages();
  }, [currentUser, navigate, API_BASE]);

  const fetchSavedMessages = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/newsletter-messages`, { credentials: 'include' });
      const data = await res.json();
      if (res.ok) setSavedMessages(data);
    } catch (err) {
      console.error('Failed to load saved messages', err);
    }
  };

  const fetchEmails = async () => {
    if (!newsletterValue) {
      setError('Please select a newsletter list.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/newsletter/list?value=${newsletterValue}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        setEmails(data);
        setError('');
      } else {
        setError(data.error || 'Failed to fetch emails.');
      }
    } catch {
      setError('Server error.');
    }
  };

  const sendNewsletter = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/newsletter/send`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: emailSubject, body: emailBody, emails }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send newsletter');
      setMessage('Newsletter sent successfully!');
      setError('');
    } catch (err) {
      setError(err.message || 'Error sending newsletter.');
    }
  };

  const saveNewsletter = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/newsletter-messages`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsletter_value: newsletterValue, subject: emailSubject, body: emailBody }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save newsletter');
      setMessage('Newsletter saved.');
      setError('');
      fetchSavedMessages();
    } catch (err) {
      setError(err.message || 'Error saving newsletter.');
    }
  };

  const handleDeleteMessage = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/newsletter-messages/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setSavedMessages(prev => prev.filter(m => m.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete message', err);
    }
  };

  const handleLoadMessage = (id) => {
    const msg = savedMessages.find(m => m.id === parseInt(id));
    if (msg) {
      setNewsletterValue(msg.newsletter_value);
      setEmailSubject(msg.subject);
      setEmailBody(msg.body);
    }
  };

  const handleDeleteEmail = async (email) => {
    try {
      const res = await fetch(`${API_BASE}/api/newsletter/unsubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmails(prev => prev.filter(e => e !== email));
        setMessage(`Unsubscribed ${email}`);
      } else {
        setError(data.error || 'Failed to unsubscribe.');
      }
    } catch {
      setError('Server error.');
    }
  };

  return (
    <div className="newsletter-page">
      <Helmet>
        <title>Newsletter Signups - Admin Only</title>
        <meta name="description" content="View and manage newsletter subscribers. Admin Only" />
      </Helmet>

      {currentUser?.role === 'admin' && (
        <div className="newsletter-form">
          <h1><EditableField contentKey="newsletter_title" defaultText="Newsletter Email List" /></h1>

          <label>Select Newsletter List</label>
          <select className="form-select mb-3" value={newsletterValue} onChange={(e) => setNewsletterValue(e.target.value)}>
            <option value="">Choose list...</option>
            {availableLists.map((val, idx) => (
              <option key={idx} value={val}>{val}</option>
            ))}
          </select>

          <button onClick={fetchEmails} className="newsletter-form-fetch">
            <EditableField contentKey="newsletter_fetch_button" defaultText="Fetch Emails" />
          </button>

          {error && <div className="text-danger mt-2">{error}</div>}
          {message && <div className="text-success mt-2">{message}</div>}

          {emails.length > 0 && (
            <ul className="newsletter-result mt-3">
              {emails.map((email) => (
                <li key={email}>
                  {email}
                  <button className="icon-btn newsletter-form-delete" onClick={() => handleDeleteEmail(email)} title="Unsubscribe">
                    <i className="bi bi-trash-fill trash"></i>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="newsletter-email-editor mt-5">
            <h3><EditableField contentKey="newsletter_compose_title" defaultText="Compose Newsletter" /></h3>

            <label>Load Saved Message</label>
            <select className="form-select mb-3" onChange={(e) => handleLoadMessage(e.target.value)}>
              <option value="">Select saved...</option>
              {savedMessages.map((msg) => (
                <option key={msg.id} value={msg.id}>{msg.subject}</option>
              ))}
            </select>

            <ul className="list-unstyled mb-3">
              {savedMessages.map((msg) => (
                <li key={`del-${msg.id}`} className="d-flex justify-content-between align-items-center small mb-1">
                  <span>{msg.subject}</span>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDeleteMessage(msg.id)} title="Delete this saved message">
                    <i className="bi bi-trash"></i>
                  </button>
                </li>
              ))}
            </ul>

            <input
              type="text"
              placeholder="Subject"
              className="form-control mb-2"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
            />

            <ReactQuill
              value={emailBody}
              onChange={setEmailBody}
              className="mb-3"
              theme="snow"
              placeholder="Write your email content..."
            />

            <div className="d-flex gap-3">
              <button onClick={saveNewsletter} className="btn btn-outline-primary">
                <EditableField contentKey="newsletter_save_button" defaultText="Save Only" />
              </button>

              <span className="d-inline-block" title={!newsletterValue ? "Please choose a newsletter list to send to" : ""}>
                <button
                  onClick={sendNewsletter}
                  className="btn btn-success"
                  disabled={!newsletterValue}
                  style={!newsletterValue ? { pointerEvents: 'none', opacity: 0.5 } : {}}
                >
                  <EditableField contentKey="newsletter_send_button" defaultText="Save & Send" />
                </button>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
