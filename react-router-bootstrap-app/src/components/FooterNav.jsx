import React from 'react';


import EditableField from '../components/EditableField';import './Footer.css';

export function FooterNav() {
  return (
    <footer className="footer-nav">
      <div className="footer-columns">
        <div>
          <h6>{<EditableField contentKey="content_36" />}</h6>
          <ul>
            <li><a href="/about">{<EditableField contentKey="content_37" />}</a></li>
            <li><a href="/about">{<EditableField contentKey="content_38" />}</a></li>
            <li><a href="/careers">{<EditableField contentKey="content_39" />}</a></li>
          </ul>
        </div>
        <div>
          <h6>{<EditableField contentKey="content_40" />}</h6>
          <ul>
            <li><a href="/faq">{<EditableField contentKey="content_41" />}</a></li>
            <li><a href="/support">{<EditableField contentKey="content_42" />}</a></li>
            <li><a href="/returns">{<EditableField contentKey="content_43" />}</a></li>
          </ul>
        </div>
        <div>
          <h6>{<EditableField contentKey="content_44" />}</h6>
          <ul>
            <li><a href="/terms">{<EditableField contentKey="content_45" />}</a></li>
            <li><a href="/privacy">{<EditableField contentKey="content_46" />}</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-copy">{<EditableField contentKey="content_47" />}</div>
    </footer>
  );
}