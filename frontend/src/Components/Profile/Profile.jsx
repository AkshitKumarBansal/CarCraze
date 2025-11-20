import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { useToast } from '../../Hooks/useToast';
import './Profile.css';

const Profile = () => {
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    businessInfo: ''
  });

  useEffect(() => {
    // Retrieve user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setFormData({
        firstName: parsedUser.firstName || '',
        lastName: parsedUser.lastName || '',
        phone: parsedUser.phone || '',
        businessInfo: parsedUser.businessInfo || ''
      });
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.phone.trim()) {
      toast.warning('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.PROFILE, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      // Update localStorage with new user data
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setIsEditing(false);
      toast.success('✅ Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('❌ ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original user data
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      businessInfo: user.businessInfo || ''
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>👤 My Profile</h1>
          <p>Manage your personal information</p>
        </div>

        <div className="profile-card">
          {!isEditing ? (
            // View Mode
            <div className="profile-view">
              <div className="profile-info-grid">
                <div className="info-item">
                  <label>First Name</label>
                  <div className="info-value">{user.firstName}</div>
                </div>
                <div className="info-item">
                  <label>Last Name</label>
                  <div className="info-value">{user.lastName}</div>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <div className="info-value">{user.email}</div>
                </div>
                <div className="info-item">
                  <label>Phone</label>
                  <div className="info-value">{user.phone || 'Not Provided'}</div>
                </div>
                <div className="info-item">
                  <label>Role</label>
                  <div className="info-value role-badge">{user.role}</div>
                </div>
                {user.role === 'seller' && (
                  <div className="info-item full-width">
                    <label>Business Information</label>
                    <div className="info-value">{user.businessInfo || 'Not Provided'}</div>
                  </div>
                )}
              </div>
              <button className="btn-edit" onClick={() => setIsEditing(true)}>
                ✏️ Edit Profile
              </button>
            </div>
          ) : (
            // Edit Mode
            <form className="profile-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="Enter first name"
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    placeholder="Enter last name"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="disabled-input"
                  />
                  <small>Email cannot be changed</small>
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="Enter phone number"
                  />
                </div>
                {user.role === 'seller' && (
                  <div className="form-group full-width">
                    <label>Business Information</label>
                    <textarea
                      name="businessInfo"
                      value={formData.businessInfo}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Enter business details, description, etc."
                    />
                  </div>
                )}
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading ? '💾 Saving...' : '💾 Save Changes'}
                </button>
                <button type="button" className="btn-cancel" onClick={handleCancel} disabled={loading}>
                  ❌ Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
