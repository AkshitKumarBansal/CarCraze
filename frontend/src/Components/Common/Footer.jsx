import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">
          <Link to="/" className="logo">
            <svg viewBox="0 0 120 60" className="car-logo">
              <defs>
                <linearGradient id="footerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ffffff"/>
                  <stop offset="100%" stopColor="#e5e7eb"/>
                </linearGradient>
              </defs>
              <path d="M20 35 Q25 20 45 20 L75 20 Q95 20 100 35 L105 40 Q100 48 90 48 L30 48 Q20 48 15 40 Z" fill="url(#footerGradient)" />
              <path d="M35 25 Q40 22 50 22 L70 22 Q80 22 85 25 L82 32 L38 32 Z" fill="rgba(0,0,0,0.3)" />
              <path d="M38 32 L45 28 L65 28 L72 32 Z" fill="rgba(0,0,0,0.2)" />
              <circle cx="35" cy="45" r="8" fill="#1f2937" stroke="#374151" strokeWidth="1"/>
              <circle cx="35" cy="45" r="5" fill="#6b7280"/>
              <circle cx="85" cy="45" r="8" fill="#1f2937" stroke="#374151" strokeWidth="1"/>
              <circle cx="85" cy="45" r="5" fill="#6b7280"/>
              <circle cx="102" cy="38" r="3" fill="#fbbf24"/>
            </svg>
            <span>CarCraze</span>
          </Link>
        </div>
        <div className="footer-copyright">
          &copy; {new Date().getFullYear()} CarCraze. All rights reserved.
        </div>
        <div className="footer-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/contact">Contact Us</Link>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
