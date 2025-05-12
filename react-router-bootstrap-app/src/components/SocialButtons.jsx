import React from 'react';
import './SocialButtons.css';

export default function SocialButtons() {
  return (
    <div className="social-buttons">
      <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
        <i className="fab fa-facebook-f"></i>
      </a>
      <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
        <i className="fab fa-twitter"></i>
      </a>
      <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
        <i className="fab fa-instagram"></i>
      </a>
      <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
        <i className="fab fa-youtube"></i>
      </a>
    </div>
  );
}
