import { useState } from 'react';
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
        <i className={car.icon}></i>
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
      <div className="modal-overlay" onClick={closeBooking}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <h3>Book {car.name}</h3>
          <label>Start Date</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <label>End Date</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          <div style={{display:'flex', gap: '8px', marginTop: '12px'}}>
            <button className="btn" onClick={closeBooking}>Cancel</button>
            <button className="btn btn-primary" onClick={handleBooking} disabled={loading}>{loading ? 'Booking...' : 'Book Now'}</button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default CarCard;
