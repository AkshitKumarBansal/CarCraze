import React, { useState } from 'react';
import './Service.css';
import { useNavigate } from 'react-router-dom';

const serviceItems = [
  {
    id: 'buy-new',
    title: 'Buy New Car',
    icon: 'fas fa-car',
    color: '#0ea5e9',
    short: 'Browse latest brand-new cars from top manufacturers.',
    details: 'Explore a wide range of brand-new cars with full manufacturer warranty, latest features, and attractive financing options. Filter by brand, budget, body type, and more.'
  },
  {
    id: 'buy-old',
    title: 'Buy Old Car',
    icon: 'fas fa-car-side',
    color: '#22c55e',
    short: 'Certified pre-owned vehicles at great prices.',
    details: 'All our used cars undergo a multi-point inspection. Check service history, ownership details, and get easy loan approvals and insurance coverage.'
  },
  {
    id: 'rent',
    title: 'Rent a Car',
    icon: 'fas fa-key',
    color: '#f59e0b',
    short: 'Flexible rental plans for short or long trips.',
    details: 'Choose from daily, weekly, or monthly rental plans. Unlimited km options, roadside assistance, and door-step delivery available in select cities.'
  },
  {
    id: 'sell-new',
    title: 'Sell New Car',
    icon: 'fas fa-tags',
    color: '#a855f7',
    short: 'Dealerships can list new inventory easily.',
    details: 'Authorized dealers can onboard quickly, bulk-upload inventories, manage pricing, offers, and leads from a unified Seller Dashboard.'
  },
  {
    id: 'sell-old',
    title: 'Sell Old Car',
    icon: 'fas fa-exchange-alt',
    color: '#ef4444',
    short: 'Get the best price for your used car.',
    details: 'Instant online valuation, verified buyers, and secure ownership transfer. We help with inspection, paperwork, and RC transfer end-to-end.'
  },
  {
    id: 'put-on-rent',
    title: 'Put Car on Rent',
    icon: 'fas fa-handshake',
    color: '#14b8a6',
    short: 'Earn by renting out your car safely.',
    details: 'List your car for rental with flexible availability. We verify renters, handle payments, and provide optional insurance for extra peace of mind.'
  }
];

const Service = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState(null);

  const openDetails = (item) => setActive(item);
  const closeDetails = () => setActive(null);

  const goToFlow = (id) => {
    // Optional quick navigation for shopping/renting flows
    if (id === 'buy-new') navigate('/new-cars');
    else if (id === 'buy-old') navigate('/old-cars');
    else if (id === 'rent') navigate('/rent-cars');
  };

  return (
    <div className="services-wrapper">
      <div className="services-hero">
        <div className="container">
          <h1>Our Services</h1>
          <p>Everything you need to buy, sell, or rent a car — in one place.</p>
        </div>
      </div>

      <div className="container">
        <div className="services-grid">
          {serviceItems.map((s) => (
            <div key={s.id} className="service-card" style={{ borderTopColor: s.color }}>
              <div className="service-icon" style={{ color: s.color }}>
                <i className={s.icon}></i>
              </div>
              <h3>{s.title}</h3>
              <p className="service-short">{s.short}</p>
              <div className="service-actions">
                <button className="btn btn-outline" onClick={() => openDetails(s)}>
                  <i className="fas fa-eye"></i> View
                </button>
                {(s.id === 'buy-new' || s.id === 'buy-old' || s.id === 'rent') && (
                  <button className="btn btn-primary" onClick={() => goToFlow(s.id)}>
                    <i className="fas fa-arrow-right"></i> Start
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {active && (
        <div className="modal-overlay" onClick={closeDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeDetails}>
              <i className="fas fa-times"></i>
            </button>
            <div className="modal-header">
              <div className="service-icon big" style={{ color: active.color }}>
                <i className={active.icon}></i>
              </div>
              <h2>{active.title}</h2>
            </div>
            <p className="service-details">{active.details}</p>
            <div className="modal-actions">
              <button className="btn" onClick={closeDetails}>Close</button>
              {(active.id === 'buy-new' || active.id === 'buy-old' || active.id === 'rent') && (
                <button className="btn btn-primary" onClick={() => { goToFlow(active.id); closeDetails(); }}>
                  Continue
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Service;
