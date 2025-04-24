import React from 'react';
import './Footer.css';

export function FooterNav() {
  return (
    <footer className="footer-nav">
      <div className="footer-columns">
        <div>
          <h6>Company</h6>
          <ul>
            <li><a href="/about">About Us</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/careers">Careers</a></li>
          </ul>
        </div>
        <div>
          <h6>Help</h6>
          <ul>
            <li><a href="/faq">FAQ</a></li>
            <li><a href="/support">Support</a></li>
            <li><a href="/returns">Returns</a></li>
          </ul>
        </div>
        <div>
          <h6>Legal</h6>
          <ul>
            <li><a href="/terms">Terms of Service</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-copy">© 2025 Your Company. All rights reserved.</div>
    </footer>
  );
}