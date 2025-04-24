import React from 'react';
import './Footer.css';

export function FooterNewsletter() {
  return (
    <div className="footer-newsletter">
      <h5>Subscribe to Our Newsletter</h5>
      <p>Get exclusive discounts, new kit drops, and parenting hacks every month!</p>
      <form className="newsletter-form">
        <input type="email" placeholder="Enter your email" required />
        <button type="submit">Subscribe</button>
      </form>
    </div>
  );
}