import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { API_ENDPOINTS } from '../../config/api';

const CarCard = ({ car, onActionSuccess }) => {
  const formatPrice = (price, category) => {
    if (category === 'rent') {
      return `₹${price}/day`;
    } else {
      return `₹${price.toLocaleString()}`;
    }
  };

  const getButtonText = (category) => {
    switch(category) {
      case 'rent': return 'Book Now';
      case 'buy-new': return 'Buy New';
      case 'buy-used': return 'Buy Used';
      default: return 'View Details';
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);

  // prevent background scrolling / interaction when either modal is open
  useEffect(() => {
    if (showImage || showModal) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => document.body.classList.remove('overflow-hidden');
  }, [showImage, showModal]);

  // Render modal content into document.body so the overlay sits above everything
  const ModalPortal = ({ children, onClose }) => {
    if (typeof document === 'undefined') return null;
    return createPortal(
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity" 
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md transform transition-all" 
          onClick={e => e.stopPropagation()}
        >
          {children}
        </div>
      </div>,
      document.body
    );
  };

  const openBooking = () => setShowModal(true);
  const closeBooking = () => {
    setShowModal(false);
    setStartDate('');
    setEndDate('');
  };

  const handleBooking = async () => {
    if (!startDate || !endDate) return alert('Please enter start and end dates');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_ENDPOINTS.RENTALS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ carId: car.raw?._id || car.id, startDate, endDate })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Booking failed');
      
      // Close modal and refresh parent list
      closeBooking();
      if (onActionSuccess) onActionSuccess();
      alert('Booking successful');
    } catch (err) {
      console.error('Booking error:', err);
      alert(err.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)] border border-gray-100 h-full">
        <div className="relative h-[180px] bg-gray-100 overflow-hidden cursor-zoom-in group">
          {car.image ? (
            <img
              src={car.image.replace(/localhost:\d+/, 'localhost:5001')}
              alt={car.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onClick={() => { setImageSrc(car.image.replace(/localhost:\d+/, 'localhost:5001')); setShowImage(true); }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
              <i className={car.icon || "fas fa-car"}></i>
            </div>
          )}
        </div>
        
        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-1">{car.name}</h3>
          
          <div className="flex flex-wrap gap-2 mb-5">
            <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5">
              <i className="fas fa-users text-gray-400"></i> {car.seats} seats
            </span>
            <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5">
              <i className="fas fa-cog text-gray-400"></i> {car.transmission}
            </span>
            <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5">
              <i className="fas fa-gas-pump text-gray-400"></i> {car.fuel}
            </span>
          </div>
          
          <div className="mt-auto flex flex-col gap-3 border-t border-gray-100 pt-4">
            <div className="text-xl font-extrabold text-blue-600">
              {formatPrice(car.price, car.category)}
            </div>
            <button 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-2.5 rounded-xl shadow-md transition-all hover:shadow-lg hover:-translate-y-px" 
              onClick={() => {
                if (car.category === 'rent') openBooking();
                else alert('Action not implemented yet');
              }}
            >
              {getButtonText(car.category)}
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <ModalPortal onClose={closeBooking}>
          <h3 className="text-xl font-bold text-gray-900 mb-5">Book {car.name}</h3>
          
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Start Date</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)} 
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">End Date</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)} 
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
            <button 
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors" 
              onClick={closeBooking}
            >
              Cancel
            </button>
            <button 
              className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed" 
              onClick={handleBooking} 
              disabled={loading}
            >
              {loading ? 'Booking...' : 'Book Now'}
            </button>
          </div>
        </ModalPortal>
      )}

      {showImage && (
        <div 
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm p-4 transition-opacity" 
          onClick={() => setShowImage(false)}
        >
          <div className="w-full max-w-5xl flex justify-end mb-4">
            <button 
              className="bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-5 rounded-lg transition-colors backdrop-blur-md" 
              onClick={() => setShowImage(false)}
            >
              Close
            </button>
          </div>
          <div className="flex-1 w-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <img
              src={imageSrc}
              alt={car.name}
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default CarCard;