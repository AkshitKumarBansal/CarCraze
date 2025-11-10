import React, { useState } from 'react';
import './Service.css';
import { useNavigate } from 'react-router-dom';
import useScrollAnimation from '../../Hooks/useScrollAnimation';

const allServiceItems = [
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

const Service = ({ mode = 'all' }) => {
  const navigate = useNavigate();
  const [active, setActive] = useState(null);
  const [sectionRef, sectionVisible] = useScrollAnimation(0.2);

  // Determine which service cards to show based on mode
  // mode: 'all' | 'buyer' | 'seller'
  const buyerIds = ['buy-new', 'buy-old', 'rent'];
  const sellerIds = ['sell-new', 'sell-old', 'put-on-rent'];

  const visibleItems = allServiceItems.filter(item => {
    if (mode === 'buyer') return buyerIds.includes(item.id);
    if (mode === 'seller') return sellerIds.includes(item.id);
    return true; // all
  });

  const openDetails = (item) => setActive(item);
  const closeDetails = () => setActive(null);

  const goToFlow = (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }
    switch(id) {
      case 'buy-new': navigate('/new-cars'); break;
      case 'buy-old': navigate('/old-cars'); break;
      case 'rent': navigate('/rent-cars'); break;
      case 'sell-new':
      case 'sell-old':
      case 'put-on-rent':
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (userData.role === 'seller') navigate('/seller/dashboard');
        else navigate('/signup', { state: { role: 'seller' } });
        break;
      default: navigate('/');
    }
  };

  // Child component so hooks (useScrollAnimation) are used at top-level of a component
  const ServiceCard = ({ s }) => {
    const [cardRef, cardVisible] = useScrollAnimation(0.15);
    return (
      <div
        key={s.id}
        ref={cardRef}
        className={`service-card-modern ${cardVisible ? 'animate-fade-in-up' : ''}`}
        style={{ '--accent': s.color }}
      >
        <div className="service-card-icon-bg">
          <span className="service-card-icon" style={{ color: s.color }}>
            <i className={s.icon}></i>
          </span>
        </div>
        <div className="service-card-content">
          <h3>{s.title}</h3>
          <p className="service-card-short">{s.short}</p>
        </div>
        <div className="service-card-actions">
          <button className="btn-modern btn-view" onClick={() => openDetails(s)}>
            <i className="fas fa-eye"></i> Details
          </button>
          <button className="btn-modern btn-start" onClick={() => goToFlow(s.id)}>
            <i className="fas fa-arrow-right"></i> Start
          </button>
        </div>
      </div>
    );
  };

  return (
    <section className="services-section-modern" ref={sectionRef}>
      <div className={`services-hero-modern ${sectionVisible ? 'animate-fade-in-up' : ''}`}>
        <h1>Discover Our Car Services</h1>
        <p>Buy, sell, or rent cars with confidence. Explore all options below!</p>
      </div>
      <div className="services-cards-modern">
        {visibleItems.map((s) => (
          <ServiceCard key={s.id} s={s} />
        ))}
      </div>

      {active && (
        <div className="modal-overlay" onClick={closeDetails}>
          <div className="modal-content-modern" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeDetails}>
              <i className="fas fa-times"></i>
            </button>
            <div className="modal-header-modern">
              <span className="service-card-icon big" style={{ color: active.color }}>
                <i className={active.icon}></i>
              </span>
              <h2>{active.title}</h2>
            </div>
            <p className="service-details-modern">{active.details}</p>
            <div className="modal-actions">
              <button className="btn-modern" onClick={closeDetails}>Close</button>
              <button className="btn-modern btn-start" onClick={() => { goToFlow(active.id); closeDetails(); }}>
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Service;
