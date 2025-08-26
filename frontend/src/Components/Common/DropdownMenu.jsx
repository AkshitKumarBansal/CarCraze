import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './DropdownMenu.css';

const DropdownMenu = ({ user, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { logout } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    // Add event listener when the dropdown is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className={`dropdown ${className}`} ref={dropdownRef}>
      <button className="dropdown-toggle" onClick={toggleDropdown} aria-expanded={isOpen}>
        <img 
          src={user.avatar} 
          alt={user.name} 
          className="user-avatar"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
        />
        <span className="user-name">{user.name.split(' ')[0]}</span>
        <svg 
          className={`dropdown-arrow ${isOpen ? 'open' : ''}`} 
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      
      <div className={`dropdown-menu ${isOpen ? 'show' : ''}`}>
        <div className="dropdown-header">
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-email">{user.email}</div>
          </div>
        </div>
        
        <div className="dropdown-divider"></div>
        
        <Link to="/profile" className="dropdown-item" onClick={() => setIsOpen(false)}>
          <i className="fas fa-user"></i>
          <span>Profile</span>
        </Link>
        
        <Link to="/settings" className="dropdown-item" onClick={() => setIsOpen(false)}>
          <i className="fas fa-cog"></i>
          <span>Settings</span>
        </Link>
        
        {user.role === 'admin' && (
          <Link to="/admin" className="dropdown-item" onClick={() => setIsOpen(false)}>
            <i className="fas fa-shield-alt"></i>
            <span>Admin Dashboard</span>
          </Link>
        )}
        
        {user.role === 'seller' && (
          <Link to="/seller/dashboard" className="dropdown-item" onClick={() => setIsOpen(false)}>
            <i className="fas fa-store"></i>
            <span>Seller Dashboard</span>
          </Link>
        )}
        
        <div className="dropdown-divider"></div>
        
        <button className="dropdown-item" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default DropdownMenu;
