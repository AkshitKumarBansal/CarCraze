import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          <Link to="/" className="logo">
            <div className="logo-icon">
              <svg viewBox="0 0 120 60" className="car-logo">
                <defs>
                  <linearGradient id="carGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1d4ed8"/>
                    <stop offset="100%" stopColor="#2563eb"/>
                  </linearGradient>
                </defs>
                {/* Car body */}
                <path d="M20 35 Q25 20 45 20 L75 20 Q95 20 100 35 L105 40 Q100 48 90 48 L30 48 Q20 48 15 40 Z" fill="url(#carGradient)"/>
                {/* Windshield */}
                <path d="M35 25 Q40 22 50 22 L70 22 Q80 22 85 25 L82 32 L38 32 Z" fill="rgba(255,255,255,0.3)"/>
                {/* Side windows */}
                <path d="M38 32 L45 28 L65 28 L72 32 Z" fill="rgba(255,255,255,0.2)"/>
                {/* Wheels */}
                <circle cx="35" cy="45" r="8" fill="#1f2937" stroke="#374151" strokeWidth="1"/>
                <circle cx="35" cy="45" r="5" fill="#6b7280"/>
                <circle cx="85" cy="45" r="8" fill="#1f2937" stroke="#374151" strokeWidth="1"/>
                <circle cx="85" cy="45" r="5" fill="#6b7280"/>
                {/* Headlight */}
                <circle cx="102" cy="38" r="3" fill="#fbbf24"/>
                {/* Speed lines */}
                <path d="M5 30 L15 30 M8 35 L18 35 M5 40 L15 40" stroke="#2563eb" strokeWidth="2" opacity="0.6"/>
              </svg>
            </div>
            CarCraze
          </Link>
          <ul className="nav-links">
            <li><Link to="/#home">Home</Link></li>
            <li><Link to="/#cars">Cars</Link></li>
            <li><Link to="/#services">Services</Link></li>
            <li><Link to="/#about">About</Link></li>
            <li><Link to="/#contact">Contact</Link></li>
          </ul>
          <div className="auth-buttons">
            <Link to="/signup" className="auth-btn sign-up">Sign Up</Link>
          </div>
        </nav>
      </div>
    </header>
  );
};
export default Navbar;
