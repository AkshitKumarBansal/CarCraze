import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DropdownMenu from './DropdownMenu';
import './Navbar.css';
import './UserProfile.css';
import './DropdownMenu.css';

const Navbar = () => {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <nav className="nav">
          <div className="nav-left">
            <Link to="/" className="logo">
              <div className="logo-icon">
                <svg viewBox="0 0 120 60" className="car-logo">
                  <defs>
                    <linearGradient id="carGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#1d4ed8"/>
                      <stop offset="100%" stopColor="#2563eb"/>
                    </linearGradient>
                  </defs>
                  <path d="M20 35 Q25 20 45 20 L75 20 Q95 20 100 35 L105 40 Q100 48 90 48 L30 48 Q20 48 15 40 Z" fill="url(#carGradient)" />
                  <path d="M35 25 Q40 22 50 22 L70 22 Q80 22 85 25 L82 32 L38 32 Z" fill="rgba(255,255,255,0.3)" />
                  <path d="M38 32 L45 28 L65 28 L72 32 Z" fill="rgba(255,255,255,0.2)" />
                  <circle cx="35" cy="45" r="8" fill="#1f2937" stroke="#374151" strokeWidth="1"/>
                  <circle cx="35" cy="45" r="5" fill="#6b7280"/>
                  <circle cx="85" cy="45" r="8" fill="#1f2937" stroke="#374151" strokeWidth="1"/>
                  <circle cx="85" cy="45" r="5" fill="#6b7280"/>
                  <circle cx="102" cy="38" r="3" fill="#fbbf24"/>
                </svg>
              </div>
              <span>CarCraze</span>
            </Link>

            <button 
              className={`mobile-menu-toggle ${isMobileMenuOpen ? 'open' : ''}`}
              onClick={toggleMobileMenu}
              aria-label="Toggle navigation"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>

          <div className={`nav-right ${isMobileMenuOpen ? 'open' : ''}`}>
            <ul className="nav-links">
              <li>
                <Link 
                  to="/#home" 
                  className={location.pathname === '/' && !location.hash ? 'active' : ''}
                  onClick={(e) => {
                    if (location.pathname === '/') {
                      e.preventDefault();
                      const element = document.getElementById('home');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }
                  }}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/#featured-cars"
                  onClick={(e) => {
                    if (location.pathname === '/') {
                      e.preventDefault();
                      const element = document.getElementById('featured-cars');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }
                  }}
                >
                  Cars
                </Link>
              </li>
              <li>
                <Link 
                  to="/#services"
                  onClick={(e) => {
                    if (location.pathname === '/') {
                      e.preventDefault();
                      const element = document.getElementById('services');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }
                  }}
                >
                  Services
                </Link>
              </li>
              {user && (
                <>
                  {user.role === 'admin' && (
                    <li><Link to="/admin" className={location.pathname.startsWith('/admin') ? 'active' : ''}>Admin</Link></li>
                  )}
                  {user.role === 'seller' && (
                    <li><Link to="/seller/dashboard" className={location.pathname.startsWith('/seller') ? 'active' : ''}>Dashboard</Link></li>
                  )}
                  <li><Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>Profile</Link></li>
                </>
              )}
            </ul>

            <div className="auth-buttons">
              {user ? (
                <DropdownMenu user={user} />
              ) : (
                <Link to="/signup" className="auth-btn sign-up">Sign Up</Link>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
