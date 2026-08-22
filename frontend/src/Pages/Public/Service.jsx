import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
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
  const { user } = useAuth();
  const [active, setActive] = useState(null);
  const [sectionRef, sectionVisible] = useScrollAnimation(0.2);

  const buyerIds = ['buy-new', 'buy-old', 'rent'];
  const sellerIds = ['sell-new', 'sell-old', 'put-on-rent'];

  const visibleItems = allServiceItems.filter(item => {
    if (mode === 'buyer') return buyerIds.includes(item.id);
    if (mode === 'seller') return sellerIds.includes(item.id);
    return true; 
  });

  const openDetails = (item) => setActive(item);
  const closeDetails = () => setActive(null);

  const goToFlow = (id) => {
    if (!user) {
      navigate('/signin');
      return;
    }

    switch (id) {
      case 'buy-new': navigate('/new-cars'); break;
      case 'buy-old': navigate('/old-cars'); break;
      case 'rent': navigate('/rent-cars'); break;
      case 'sell-new':
      case 'sell-old':
      case 'put-on-rent':
        if (user.role === 'seller') navigate('/seller/dashboard');
        else navigate('/signup', { state: { role: 'seller' } });
        break;
      default: navigate('/');
    }
  };

  const ServiceCard = ({ s }) => {
    const [cardRef, cardVisible] = useScrollAnimation(0.15);
    return (
      <div
        key={s.id}
        ref={cardRef}
        className={`bg-white rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.10)] p-8 flex flex-col items-center transition-all duration-500 ease-out border-t-8 relative cursor-pointer hover:-translate-y-2 hover:scale-[1.03] hover:shadow-[0_16px_48px_rgba(0,0,0,0.13)] ${cardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        style={{ borderColor: s.color }}
      >
        <div 
          className="rounded-full w-20 h-20 flex items-center justify-center mb-5 shadow-sm"
          style={{ background: `linear-gradient(135deg, ${s.color} 0%, #ffffff 100%)` }}
        >
          <span className="text-3xl" style={{ color: s.color }}>
            <i className={s.icon}></i>
          </span>
        </div>
        
        <div className="text-center mb-5 flex-1">
          <h3 className="text-xl font-bold mb-2 text-gray-800">{s.title}</h3>
          <p className="text-gray-600 text-base leading-relaxed min-h-[48px]">{s.short}</p>
        </div>
        
        <div className="flex gap-3 mt-auto">
          <button 
            className="bg-gray-100 text-gray-800 hover:bg-indigo-50 hover:text-blue-600 px-4 py-2 rounded-xl font-semibold transition-all duration-200 shadow-sm inline-flex items-center gap-2" 
            onClick={() => openDetails(s)}
          >
            <i className="fas fa-eye"></i> Details
          </button>
          <button 
            className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-xl font-semibold transition-all duration-200 shadow-sm inline-flex items-center gap-2" 
            onClick={() => goToFlow(s.id)}
          >
            <i className="fas fa-arrow-right"></i> Start
          </button>
        </div>
      </div>
    );
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#f0f4ff] to-[#e0f7fa] flex flex-col items-center pb-16" ref={sectionRef}>
      
      {/* Hero Banner */}
      <div className={`w-full max-w-4xl mx-auto text-center pt-16 pb-8 px-4 sm:px-8 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-b-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all duration-700 ease-out ${sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 tracking-tight">Discover Our Car Services</h1>
        <p className="text-lg sm:text-xl opacity-95">Buy, sell, or rent cars with confidence. Explore all options below!</p>
      </div>
      
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-full max-w-7xl mx-auto mt-12 px-4 sm:px-8">
        {visibleItems.map((s) => (
          <ServiceCard key={s.id} s={s} />
        ))}
      </div>

      {/* Details Modal */}
      {active && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[1500]" onClick={closeDetails}>
          <div 
            className="bg-white w-full max-w-lg rounded-2xl p-8 relative shadow-2xl transition-all" 
            onClick={e => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-5 text-gray-400 hover:text-gray-600 text-2xl transition-colors" 
              onClick={closeDetails}
            >
              <i className="fas fa-times"></i>
            </button>
            
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="text-4xl" style={{ color: active.color }}>
                <i className={active.icon}></i>
              </span>
              <h2 className="text-2xl font-bold text-gray-800">{active.title}</h2>
            </div>
            
            <p className="text-gray-600 leading-relaxed text-lg text-center mb-8">
              {active.details}
            </p>
            
            <div className="flex gap-4 justify-center">
              <button 
                className="bg-gray-100 text-gray-800 hover:bg-gray-200 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-sm" 
                onClick={closeDetails}
              >
                Close
              </button>
              <button 
                className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-sm inline-flex items-center gap-2" 
                onClick={() => { goToFlow(active.id); closeDetails(); }}
              >
                Continue <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Service;