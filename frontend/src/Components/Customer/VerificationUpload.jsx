import React, { useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const VerificationUpload = ({ onUploadSuccess }) => {
  // 1. Replaced file states with text/date states
  const [dlNumber, setDlNumber] = useState('');
  const [dob, setDob] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 2. Updated validation
    if (!dlNumber || !dob) {
      return setError('Both Driving License Number and Date of Birth are required.');
    }

    try {
      setLoading(true);
      setError('');
      
      // 3. Send a standard JSON payload instead of FormData
      const response = await axios.post(API_ENDPOINTS.VERIFY_IDENTITY, {
        dlNumber: dlNumber.trim(),
        dob: dob
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      // 4. Handle successful API verification
      if (response.data.status === 'ACTIVE' || response.data.success) {
        if (typeof onUploadSuccess === 'function') {
          onUploadSuccess(response.data.status); // Pass the status back up to the parent
        } else {
          window.location.reload();
        }
      } else {
        setError(`Verification failed: License is ${response.data.status || 'invalid'}.`);
      }
    } catch (err) {
      if (err.isAxiosError) {
        setError(err.response?.data?.message || 'Verification failed. Please check your details and try again.');
      } else {
        console.error("Frontend Code Error:", err);
        setError('An unexpected error occurred during verification.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[20px] p-6 md:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-gray-100 max-w-2xl mx-auto font-sans">
      
      {/* Header Section */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-extrabold text-gray-800 mb-2">Instant License Verification</h3>
        <p className="text-gray-500 text-[1.05rem]">
          Please enter your Driving License details to instantly verify your account and book cars.
        </p>
      </div>
      
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-100 mb-6 text-sm font-medium flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}
      
      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {/* Driving License Number Input */}
        <div className="flex flex-col gap-2">
          <label className="text-[0.9rem] font-semibold text-gray-400 uppercase tracking-[0.5px]">
            Driving License Number
          </label>
          <input 
            type="text" 
            placeholder="e.g., RJ1320120123456"
            value={dlNumber}
            onChange={(e) => setDlNumber(e.target.value.toUpperCase())}
            className="w-full text-gray-800 text-base bg-gray-50 border-2 border-gray-200 rounded-[10px] p-3 transition-all focus:outline-none focus:border-[#667eea] focus:ring-[3px] focus:ring-[#667eea]/10 uppercase"
          />
        </div>
        
        {/* Date of Birth Input */}
        <div className="flex flex-col gap-2">
          <label className="text-[0.9rem] font-semibold text-gray-400 uppercase tracking-[0.5px]">
            Date of Birth (As per License)
          </label>
          <input 
            type="date" 
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full text-gray-800 text-base bg-gray-50 border-2 border-gray-200 rounded-[10px] p-3 transition-all focus:outline-none focus:border-[#667eea] focus:ring-[3px] focus:ring-[#667eea]/10"
          />
        </div>

        {/* Submit Button */}
        <div className="mt-4">
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none py-4 px-10 rounded-xl text-[1.05rem] font-semibold cursor-pointer transition-all duration-300 shadow-[0_4px_15px_rgba(102,126,234,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(102,126,234,0.4)] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying Details...
              </>
            ) : (
              '🔍 Verify License'
            )}
          </button>
        </div>
        
      </form>
    </div>
  );
};

export default VerificationUpload;