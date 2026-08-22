import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
// Adjust the import path to match your API config file
import api from '../../config/api';
import VerificationUpload from './VerificationUpload';

const RentalBookingForm = ({ carId, onBookingSuccess }) => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  
  const [pricing, setPricing] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // NEW: State to track if the user needs to upload documents
  const [requiresVerification, setRequiresVerification] = useState(false);

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
      setError(null);
      const response = await api.post('/rentals', {
        carId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      alert('Booking Confirmed!');
      if (onBookingSuccess) onBookingSuccess(response.data);
    } catch (err) {
      // NEW: Intercept the 403 Verification Error
      if (err.response?.status === 403 && err.response?.data?.message?.includes('verification')) {
        setRequiresVerification(true);
      } else {
        setError(err.response?.data?.message || 'Failed to book car.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // NEW: Conditionally render the upload form if blocked by the backend
  if (requiresVerification) {
    return (
      <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 p-6 flex flex-col gap-4">
        <VerificationUpload 
          onUploadSuccess={(verificationData) => {
            alert('Documents submitted! Your account is pending review. You will be able to book once approved.');
            setRequiresVerification(false);
            // Optionally, reset the form completely so they can try again later
            setDateRange([null, null]);
            setPricing(null);
          }} 
        />
        <button 
          onClick={() => setRequiresVerification(false)}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline text-center"
        >
          Cancel and return to booking
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 p-6 flex flex-col gap-4">
      <h3 className="text-xl font-bold text-gray-900 mb-2">Select Rental Dates</h3>
      
      <div className="relative">
        <DatePicker
          selectsRange={true}
          startDate={startDate}
          endDate={endDate}
          onChange={(update) => setDateRange(update)}
          minDate={new Date()} // Prevent past bookings
          placeholderText="Start Date - End Date"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-700 bg-gray-50"
          showTimeSelect // Enables hourly selections
          dateFormat="MMMM d, yyyy h:mm aa"
        />
      </div>

      {isLoading && (
        <p className="text-blue-600 font-medium text-sm animate-pulse flex items-center gap-2 mt-2">
          <i className="fas fa-spinner fa-spin"></i> Calculating pricing...
        </p>
      )}
      
      {error && (
        <p className="text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-xl text-sm font-medium mt-2">
          {error}
        </p>
      )}

      {pricing && (
        <div className="mt-4 bg-blue-50/50 rounded-xl p-5 border border-blue-100">
          <h4 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-blue-200/50">Pricing Breakdown</h4>
          <ul className="space-y-3 mb-6">
            <li className="flex justify-between items-center text-sm text-gray-600">
              <span className="font-medium">Tier:</span> 
              <span className="text-gray-900 capitalize">{pricing.rentalTier}</span>
            </li>
            <li className="flex justify-between items-center text-sm text-gray-600">
              <span className="font-medium">Duration:</span> 
              <span className="text-gray-900">{pricing.durationUnits} {pricing.rentalTier === 'hourly' ? 'hours' : 'days'}</span>
            </li>
            <li className="flex justify-between items-center text-sm text-gray-600">
              <span className="font-medium">Base Rate:</span> 
              <span className="text-gray-900">${pricing.baseRate}</span>
            </li>
            {pricing.surgeFee > 0 && (
              <li className="flex justify-between items-center text-sm text-gray-600">
                <span className="font-medium">Weekend Surge:</span> 
                <span className="text-amber-600 font-semibold">+${pricing.surgeFee}</span>
              </li>
            )}
            <li className="flex justify-between items-center pt-3 mt-3 border-t border-blue-200/50">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-extrabold text-xl text-blue-700">${pricing.totalCalculatedPrice}</span>
            </li>
          </ul>
          
          <button 
            onClick={handleBookNow} 
            disabled={isLoading}
            className="w-full bg-gradient-to-br from-blue-600 to-blue-800 text-white font-bold py-3.5 px-6 rounded-xl shadow-[0_4px_14px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
          >
            Confirm & Book
          </button>
        </div>
      )}
    </div>
  );
};

export default RentalBookingForm;