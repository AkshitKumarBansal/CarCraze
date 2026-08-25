import React, { useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const VerificationUpload = ({ onUploadSuccess }) => {
  const [idDocument, setIdDocument] = useState(null);
  const [drivingLicense, setDrivingLicense] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e, setter) => {
    setter(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idDocument || !drivingLicense) {
      return setError('Both documents are required.');
    }
    const formData = new FormData();
    formData.append('idDocument', idDocument);
    formData.append('drivingLicense', drivingLicense);
    try {
      setLoading(true);
      setError('');
      const response = await axios.post(API_ENDPOINTS.VERIFY_IDENTITY, formData, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (response.data.success) {
        if (typeof onUploadSuccess === 'function') {
          onUploadSuccess(response.data.verification);
        } else {
          window.location.reload();
        }
      }
    } catch (err) {
      if (err.isAxiosError) {
        setError(err.response?.data?.message || 'Upload failed. Please try again.');
      } else {
        console.error("Frontend Code Error:", err);
        window.location.reload(); 
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[20px] p-6 md:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-gray-100 max-w-2xl mx-auto font-sans">
      
      {/* Header Section */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-extrabold text-gray-800 mb-2">Identity Verification Required</h3>
        <p className="text-gray-500 text-[1.05rem]">
          Please upload your documents to continue booking rentals and unlock full features.
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
        
        {/* ID Document Input */}
        <div className="flex flex-col gap-2">
          <label className="text-[0.9rem] font-semibold text-gray-400 uppercase tracking-[0.5px]">
            Government ID (PDF/Image)
          </label>
          <input 
            type="file" 
            accept=".jpg,.jpeg,.png,.pdf" 
            onChange={(e) => handleFileChange(e, setIdDocument)}
            className="w-full text-gray-600 text-sm bg-gray-50 border-2 border-gray-200 rounded-[10px] p-2 cursor-pointer transition-all focus:outline-none focus:border-[#667eea] focus:ring-[3px] focus:ring-[#667eea]/10 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#f0f4ff] file:text-[#667eea] hover:file:bg-[#e8eeff] file:transition-colors file:cursor-pointer"
          />
        </div>
        
        {/* Driving License Input */}
        <div className="flex flex-col gap-2">
          <label className="text-[0.9rem] font-semibold text-gray-400 uppercase tracking-[0.5px]">
            Driving License (PDF/Image)
          </label>
          <input 
            type="file" 
            accept=".jpg,.jpeg,.png,.pdf" 
            onChange={(e) => handleFileChange(e, setDrivingLicense)}
            className="w-full text-gray-600 text-sm bg-gray-50 border-2 border-gray-200 rounded-[10px] p-2 cursor-pointer transition-all focus:outline-none focus:border-[#667eea] focus:ring-[3px] focus:ring-[#667eea]/10 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#f0f4ff] file:text-[#667eea] hover:file:bg-[#e8eeff] file:transition-colors file:cursor-pointer"
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
                {/* Simple loading spinner SVG */}
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : (
              '📤 Submit Documents'
            )}
          </button>
        </div>
        
      </form>
    </div>
  );
};

export default VerificationUpload;