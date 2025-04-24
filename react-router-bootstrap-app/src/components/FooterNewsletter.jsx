import React from 'react';


import EditableField from '../components/EditableField';import './Footer.css';

export function FooterNewsletter() {
  return (
    <div className="footer-newsletter">
      <h5>{<EditableField contentKey="content_48" />}</h5>
      <p>{<EditableField contentKey="content_49" />}</p>
      <form className="newsletter-form">
        <input type="email" placeholder="Enter your email" required />
        <button type="submit">{<EditableField contentKey="content_50" />}</button>
      </form>
    </div>
  );
}