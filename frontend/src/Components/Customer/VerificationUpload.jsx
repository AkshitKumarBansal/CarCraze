import React, { useState } from 'react';
import axios from 'axios'; // Or use your custom api config instance

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
      
      // Note: When using FormData, do NOT manually set the 'Content-Type' header. 
      // The browser automatically sets it with the correct boundary.
      const response = await axios.post('/api/auth/verify-identity', formData, {
        withCredentials: true, // If you are using cookies for auth
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}` // If using localStorage
        }
      });

      if (response.data.success) {
        onUploadSuccess(response.data.verification);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verification-container">
      <h3>Identity Verification Required</h3>
      <p>Please upload your documents to continue booking rentals.</p>
      {error && <div className="error-alert">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Government ID (PDF/Image)</label>
          <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => handleFileChange(e, setIdDocument)} />
        </div>
        <div className="form-group">
          <label>Driving License (PDF/Image)</label>
          <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => handleFileChange(e, setDrivingLicense)} />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Submit Documents'}
        </button>
      </form>
    </div>
  );
};

export default VerificationUpload;