import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { useToast } from '../../Hooks/useToast';
import ErrorBoundary from '../Common/ErrorBoundary';
import './Profile.css';

const ProfileContent = () => {
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    businessName: '',
    businessEmail: '',
    businessPhone: '',
    businessAddress: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // First try to get from localStorage for immediate display
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          updateFormData(parsedUser);
        }

        // Then fetch fresh data from backend
        const response = await fetch(API_ENDPOINTS.PROFILE, {
          credentials: 'include'
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          updateFormData(userData);
          // Update localStorage
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

  const updateFormData = (userData) => {
    // Handle businessInfo safely (it might be an object or missing)
    const biz = userData.businessInfo || {};
    // If it's a string (legacy data), just put it in description or ignore
    const bizName = typeof biz === 'object' ? biz.name : '';
    const bizEmail = typeof biz === 'object' ? biz.email : '';
    const bizPhone = typeof biz === 'object' ? biz.phone : '';
    const bizAddress = typeof biz === 'object' ? biz.address : '';

    setFormData(prev => ({
      ...prev,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      phone: userData.phone || '',
      businessName: bizName || '',
      businessEmail: bizEmail || '',
      businessPhone: bizPhone || '',
      businessAddress: bizAddress || ''
    }));
  };

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
      // Construct payload
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        businessInfo: {
          name: formData.businessName,
          email: formData.businessEmail,
          phone: formData.businessPhone,
          address: formData.businessAddress
        }
      };

      const response = await fetch(API_ENDPOINTS.PROFILE, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      // Update localStorage with new user data
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      updateFormData(data.user);
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
    if (user) {
      updateFormData(user);
    }
    setIsEditing(false);
  };

  // Helper to safely get business info fields
  const getBizField = (field) => {
    if (user && user.businessInfo && typeof user.businessInfo === 'object') {
      return user.businessInfo[field] || 'Not Provided';
    }
    return 'Not Provided';
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
                  <>
                    <div className="info-item full-width separator">
                      <h3>Business Information</h3>
                    </div>
                    <div className="info-item">
                      <label>Business Name</label>
                      <div className="info-value">{getBizField('name')}</div>
                    </div>
                    <div className="info-item">
                      <label>Business Email</label>
                      <div className="info-value">{getBizField('email')}</div>
                    </div>
                    <div className="info-item">
                      <label>Business Phone</label>
                      <div className="info-value">{getBizField('phone')}</div>
                    </div>
                    <div className="info-item full-width">
                      <label>Business Address</label>
                      <div className="info-value">{getBizField('address')}</div>
                    </div>
                  </>
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
                  <>
                    <div className="form-group full-width separator">
                      <h3>Business Information</h3>
                    </div>
                    <div className="form-group">
                      <label>Business Name</label>
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        placeholder="Business Name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Business Email</label>
                      <input
                        type="email"
                        name="businessEmail"
                        value={formData.businessEmail}
                        onChange={handleChange}
                        placeholder="Business Email"
                      />
                    </div>
                    <div className="form-group">
                      <label>Business Phone</label>
                      <input
                        type="tel"
                        name="businessPhone"
                        value={formData.businessPhone}
                        onChange={handleChange}
                        placeholder="Business Phone"
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Business Address</label>
                      <input
                        type="text"
                        name="businessAddress"
                        value={formData.businessAddress}
                        onChange={handleChange}
                        placeholder="Business Address"
                      />
                    </div>
                  </>
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

const Profile = () => {
  return (
    <ErrorBoundary>
      <ProfileContent />
    </ErrorBoundary>
  );
};

export default Profile;
