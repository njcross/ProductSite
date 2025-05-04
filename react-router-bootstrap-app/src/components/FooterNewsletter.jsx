// src/components/FooterNewsletter.jsx
import { useState } from 'react';
import EditableField from './EditableField';
import './Footer.css';

export function FooterNewsletter() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const API_BASE = process.env.REACT_APP_API_URL;

  const handleSubscribe = async () => {
    if (!email) return;
    try {
      const res = await fetch(`${API_BASE}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          credentials: 'include',
        },
        credentials: 'include',
        body: JSON.stringify({ email, newsletter_value: '1' }),
      });
      if (res.ok) {
        setMessage('Subscribed successfully!');
        setSubscribed(true);
      } else {
        const data = await res.json();
        setMessage(data.message || 'Subscription failed.');
      }
    } catch {
      setMessage('Error subscribing.');
    }
  };

  const handleUnsubscribe = async () => {
    if (!email) return;
    try {
      const res = await fetch(`${API_BASE}/api/newsletter/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          credentials: 'include',
        },
        credentials: 'include',
        body: JSON.stringify({ email, newsletter_value: 'general' }),
      });
      if (res.ok) {
        setMessage('Unsubscribed successfully!');
        setSubscribed(false);
      } else {
        const data = await res.json();
        setMessage(data.message || 'Unsubscribe failed.');
      }
    } catch {
      setMessage('Error unsubscribing.');
    }
  };

  return (
    <div className="footer-newsletter">
  <div className="newsletter-content-wrapper">
    <div className="newsletter-text">
      <h4><EditableField contentKey="content_48" /></h4>
      <p><EditableField contentKey="content_49" /></p>
    </div>

    <div className="newsletter-form">
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {!subscribed ? (
        <button onClick={handleSubscribe}>
          <EditableField contentKey="content_50" />
        </button>
      ) : (
        <button onClick={handleUnsubscribe}>
          <EditableField contentKey="unsub_label" />
        </button>
      )}
    </div>
  </div>
  {message && <p className="newsletter-message">{message}</p>}
</div>
  );
}
