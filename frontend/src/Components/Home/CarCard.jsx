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
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [showImage, showModal]);

  // Render modal content into document.body so the overlay sits above everything
  const ModalPortal = ({ children, onClose }) => {
    if (typeof document === 'undefined') return null;
    return createPortal(
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()}>
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
    <div className="car-card">
      <div className="car-image">
        {car.image ? (
          <img
            src={car.image.replace(/localhost:\d+/, 'localhost:5001')}
            alt={car.name}
            style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: 8, cursor: 'zoom-in' }}
            onClick={() => { setImageSrc(car.image.replace(/localhost:\d+/, 'localhost:5001')); setShowImage(true); }}
          />
        ) : (
          <i className={car.icon}></i>
        )}
      </div>
      <div className="car-info">
        <h3 className="car-name">{car.name}</h3>
        <div className="car-features">
          <span><i className="fas fa-users"></i> {car.seats} seats</span>
          <span><i className="fas fa-cog"></i> {car.transmission}</span>
          <span><i className="fas fa-gas-pump"></i> {car.fuel}</span>
        </div>
        <div className="car-price">
          {formatPrice(car.price, car.category)}
        </div>
        <button className="btn btn-primary" style={{width: '100%'}} onClick={() => {
          if (car.category === 'rent') openBooking();
          else alert('Action not implemented yet');
        }}>
          {getButtonText(car.category)}
        </button>
      </div>
  </div>
  {showModal && (
    <ModalPortal onClose={closeBooking}>
      <h3>Book {car.name}</h3>
      <label>Start Date</label>
      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
      <label>End Date</label>
      <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
      <div style={{display:'flex', gap: '8px', marginTop: '12px'}}>
        <button className="btn" onClick={closeBooking}>Cancel</button>
        <button className="btn btn-primary" onClick={handleBooking} disabled={loading}>{loading ? 'Booking...' : 'Book Now'}</button>
      </div>
    </ModalPortal>
  )}
    {showImage && (
      <ModalPortal onClose={() => setShowImage(false)}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn" onClick={() => setShowImage(false)} style={{}}>Close</button>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src={imageSrc}
            alt={car.name}
            style={{
              maxWidth: '100%',
              maxHeight: 'calc(80vh - 40px)',
              objectFit: 'contain',
              borderRadius: 8
            }}
          />
        </div>
      </ModalPortal>
    )}
    </>
  );
};

export default CarCard;
