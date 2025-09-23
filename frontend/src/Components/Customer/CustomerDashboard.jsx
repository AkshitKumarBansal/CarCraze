import React from 'react';
import './CustomerDashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faCarSide, faKey } from '@fortawesome/free-solid-svg-icons';

const CustomerDashboard = () => {
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-header">Welcome to your Dashboard</h1>
      <p className="dashboard-content">
        Explore our services or manage your account.
      </p>

      <div className="options-grid">
        {/* New Cars Card */}
        <div className="option-card">
          <FontAwesomeIcon icon={faCar} className="option-icon" />
          <h3 className="option-title">New Cars</h3>
          <p className="option-description">Browse the latest models from top brands.</p>
          <button className="option-button">Explore New Cars</button>
        </div>

        {/* Old Cars Card */}
        <div className="option-card">
          <FontAwesomeIcon icon={faCarSide} className="option-icon" />
          <h3 className="option-title">Old Cars</h3>
          <p className="option-description">Find certified pre-owned vehicles at great prices.</p>
          <button className="option-button">Discover Old Cars</button>
        </div>

        {/* Rent Cars Card */}
        <div className="option-card">
          <FontAwesomeIcon icon={faKey} className="option-icon" />
          <h3 className="option-title">Rent Cars</h3>
          <p className="option-description">Rent a car for your next trip, short or long term.</p>
          <button className="option-button">Book a Rental</button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
