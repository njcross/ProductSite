import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useContent } from '../context/ContentContext';
import EditableField from './EditableField';
import './Footer.css';

export function FooterNewsletter() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { currentUser, isAdmin } = useUser();
  const { content, updateContent } = useContent();

  const newsletterValue = content?.content_newsletter_value || 'general';
  const [selectedValue, setSelectedValue] = useState(newsletterValue);

  useEffect(() => {
    setSelectedValue(newsletterValue); // sync on mount or change
  }, [newsletterValue]);

  const API_BASE = process.env.REACT_APP_API_URL;

  const handleSubscribe = async () => {
    if (!email) return;
    try {
      const res = await fetch(`${API_BASE}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, newsletter_value: selectedValue }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Subscribed successfully!');
        setSubscribed(true);
      } else {
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
        },
        credentials: 'include',
        body: JSON.stringify({ email, newsletter_value: selectedValue }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Unsubscribed successfully!');
        setSubscribed(false);
      } else {
        setMessage(data.message || 'Unsubscribe failed.');
      }
    } catch {
      setMessage('Error unsubscribing.');
    }
  };

  const updateNewsletterValue = async (key, value) => {
  try {
    const res = await fetch(`${API_BASE}/api/update-content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        credentials: 'include',
      },
      credentials: 'include',
      body: JSON.stringify({ field: key, value }),
    });
    if (!res.ok) throw new Error('Failed to update content');
  } catch (err) {
    console.error('Error updating newsletter value:', err);
  }
};

const handleNewsletterValueChange = (e) => {
  const newValue = e.target.value;
  setSelectedValue(newValue);
  updateNewsletterValue('content_newsletter_value', newValue);
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

          {isAdmin && (
            <select
              value={selectedValue}
              onChange={handleNewsletterValueChange}
              className="newsletter-select"
            >
              <option value="general">General</option>
              <option value="product">Product Updates</option>
              <option value="promotions">Promotions</option>
            </select>
          )}

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
