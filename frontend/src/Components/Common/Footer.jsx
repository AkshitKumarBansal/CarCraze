import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    // Simulate subscription success
    alert('Thanks for subscribing to CarCraze updates!');
    setEmail('');
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="logo">
              <svg viewBox="0 0 120 60" className="car-logo" aria-hidden>
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
            <p className="brand-copy">Your trusted partner to buy, sell and rent cars with confidence.</p>
            <div className="footer-social">
              <a href="#" aria-label="Facebook" className="social">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#" aria-label="Twitter" className="social">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" aria-label="Instagram" className="social">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" aria-label="LinkedIn" className="social">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-links-group">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/profile">Profile</Link></li>
            </ul>
          </div>

          {/* Our Services */}
          <div className="footer-links-group">
            <h4>Our Services</h4>
            <ul>
              <li><Link to="/new-cars">Buy New Cars</Link></li>
              <li><Link to="/old-cars">Buy Used Cars</Link></li>
              <li><Link to="/rent-cars">Rent a Car</Link></li>
              <li><Link to="/seller/dashboard">Sell New Cars</Link></li>
              <li><Link to="/seller/dashboard">Sell Used Cars</Link></li>
              <li><Link to="/seller/dashboard">Put Car on Rent</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-contact">
            <h4>Contact</h4>
            <ul>
              <li>
                <i className="fas fa-map-marker-alt"></i>
                <span>123 CarCraze Street, New Delhi, India</span>
              </li>
              <li>
                <i className="fas fa-envelope"></i>
                <a href="mailto:info@carcraze.com">info@carcraze.com</a>
              </li>
              <li>
                <i className="fas fa-phone"></i>
                <a href="tel:+919876543210">+91 98765 43210</a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-newsletter">
            <h4>Stay in the loop</h4>
            <p>Get updates on new arrivals, offers and tips.</p>
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                aria-label="Email address"
                required
              />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <div className="footer-copyright">&copy; {new Date().getFullYear()} CarCraze. All rights reserved.</div>
          <div className="footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/contact">Contact Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
