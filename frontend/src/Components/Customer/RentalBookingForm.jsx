import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
// Adjust the import path to match your API config file
import api from '../../config/api'; 
import './RentalBookingForm.css'; // Optional: for custom styling

const RentalBookingForm = ({ carId, onBookingSuccess }) => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  
  const [pricing, setPricing] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Trigger calculation when both dates are selected
  useEffect(() => {
    if (startDate && endDate) {
      calculatePricing(startDate, endDate);
    }
  }, [startDate, endDate]);

  const calculatePricing = async (start, end) => {
    setIsLoading(true);
    setError(null);
    setPricing(null);

    try {
      const response = await api.post('/rentals/calculate', {
        carId,
        startDate: start.toISOString(),
        endDate: end.toISOString()
      });
      
      setPricing(response.data.pricingBreakdown);
    } catch (err) {
      setError(err.response?.data?.message || 'Error calculating price.');
      setDateRange([null, null]); // Reset on error (e.g., date already booked)
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookNow = async () => {
    try {
      setIsLoading(true);
      const response = await api.post('/rentals', {
        carId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      alert('Booking Confirmed!');
      if (onBookingSuccess) onBookingSuccess(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book car.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="booking-widget">
      <h3>Select Rental Dates</h3>
      
      <DatePicker
        selectsRange={true}
        startDate={startDate}
        endDate={endDate}
        onChange={(update) => setDateRange(update)}
        minDate={new Date()} // Prevent past bookings
        placeholderText="Start Date - End Date"
        className="date-picker-input"
        showTimeSelect // Enables hourly selections
        dateFormat="MMMM d, yyyy h:mm aa"
      />

      {isLoading && <p>Calculating...</p>}
      
      {error && <p className="error-text" style={{ color: 'red' }}>{error}</p>}

      {pricing && (
        <div className="pricing-summary">
          <h4>Pricing Breakdown</h4>
          <ul>
            <li>Tier: {pricing.rentalTier}</li>
            <li>Duration: {pricing.durationUnits} {pricing.rentalTier === 'hourly' ? 'hours' : 'days'}</li>
            <li>Base Rate: ${pricing.baseRate}</li>
            {pricing.surgeFee > 0 && (
              <li>Weekend Surge: +${pricing.surgeFee}</li>
            )}
            <li style={{ fontWeight: 'bold' }}>
              Total: ${pricing.totalCalculatedPrice}
            </li>
          </ul>
          
          <button 
            onClick={handleBookNow} 
            disabled={isLoading}
            className="book-now-btn"
          >
            Confirm & Book
          </button>
        </div>
      )}
    </div>
  );
};

export default RentalBookingForm;