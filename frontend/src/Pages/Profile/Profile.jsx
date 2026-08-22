import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { useToast } from '../../Hooks/useToast';
import ErrorBoundary from '../../Components/Common/ErrorBoundary';

const ProfileContent = () => {
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
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
      setLoading(true);
      try {
        const response = await fetch(API_ENDPOINTS.PROFILE, {
          credentials: 'include'
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          updateFormData(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          toast.error('Could not fetch profile. Please sign in again.');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Network error while fetching profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const updateFormData = (userData) => {
    const biz = (userData.businessInfo && typeof userData.businessInfo === 'object')
      ? userData.businessInfo
      : {};

    setFormData({
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      phone: userData.phone || '',
      businessName: biz.name || '',
      businessEmail: biz.email || '',
      businessPhone: biz.phone || '',
      businessAddress: biz.address || ''
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.phone.trim()) {
      toast.warning('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      };

      if (user.role === 'seller') {
        payload.businessInfo = {
          name: formData.businessName,
          email: formData.businessEmail,
          phone: formData.businessPhone,
          address: formData.businessAddress
        };
      }
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

  const getBizField = (field) => {
    return (user?.businessInfo?.[field] && typeof user.businessInfo === 'object')
      ? user.businessInfo[field]
      : 'Not Provided';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf1] pt-[100px] px-5 pb-10 flex items-start justify-center">
        <div className="text-center py-16 px-5 text-[1.2rem] text-gray-500 font-sans">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf1] pt-[100px] px-5 pb-10 flex items-start justify-center font-sans">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Could not load profile</h2>
          <p className="text-gray-500">Please try signing in again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf1] pt-[100px] px-4 md:px-5 pb-10 font-sans">
      <div className="max-w-[900px] mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-[2.2rem] md:text-[2.8rem] font-extrabold bg-gradient-to-br from-[#667eea] to-[#764ba2] bg-clip-text text-transparent mb-2 leading-tight">
            👤 My Profile
          </h1>
          <p className="text-gray-500 text-[1.2rem] m-0">Manage your personal information</p>
        </div>

        <div className="bg-white rounded-[20px] p-6 md:p-12 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
          {!isEditing ? (
            // View Mode
            <div className="flex flex-col gap-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2">
                  <label className="text-[0.9rem] font-semibold text-gray-400 uppercase tracking-[0.5px]">First Name</label>
                  <div className="text-[1.1rem] font-semibold text-gray-800 py-3 px-4 bg-gray-50 rounded-[10px] border-2 border-gray-200">{user.firstName}</div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[0.9rem] font-semibold text-gray-400 uppercase tracking-[0.5px]">Last Name</label>
                  <div className="text-[1.1rem] font-semibold text-gray-800 py-3 px-4 bg-gray-50 rounded-[10px] border-2 border-gray-200">{user.lastName}</div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[0.9rem] font-semibold text-gray-400 uppercase tracking-[0.5px]">Email</label>
                  <div className="text-[1.1rem] font-semibold text-gray-800 py-3 px-4 bg-gray-50 rounded-[10px] border-2 border-gray-200">{user.email}</div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[0.9rem] font-semibold text-gray-400 uppercase tracking-[0.5px]">Phone</label>
                  <div className="text-[1.1rem] font-semibold text-gray-800 py-3 px-4 bg-gray-50 rounded-[10px] border-2 border-gray-200">{user.phone || 'Not Provided'}</div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[0.9rem] font-semibold text-gray-400 uppercase tracking-[0.5px]">Role</label>
                  <div className="text-[1.1rem] font-semibold capitalize py-3 px-4 rounded-[10px] border-2 w-fit bg-gradient-to-br from-[#f0f4ff] to-[#e8eeff] text-[#667eea] border-[#dae2ff]">{user.role}</div>
                </div>

                {user.role === 'seller' && (
                  <>
                    <div className="col-span-1 md:col-span-2 mt-4 pt-4 border-t border-gray-200">
                      <h3 className="text-xl font-bold text-gray-800 m-0">Business Information</h3>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[0.9rem] font-semibold text-gray-400 uppercase tracking-[0.5px]">Business Name</label>
                      <div className="text-[1.1rem] font-semibold text-gray-800 py-3 px-4 bg-gray-50 rounded-[10px] border-2 border-gray-200">{getBizField('name')}</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[0.9rem] font-semibold text-gray-400 uppercase tracking-[0.5px]">Business Email</label>
                      <div className="text-[1.1rem] font-semibold text-gray-800 py-3 px-4 bg-gray-50 rounded-[10px] border-2 border-gray-200">{getBizField('email')}</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[0.9rem] font-semibold text-gray-400 uppercase tracking-[0.5px]">Business Phone</label>
                      <div className="text-[1.1rem] font-semibold text-gray-800 py-3 px-4 bg-gray-50 rounded-[10px] border-2 border-gray-200">{getBizField('phone')}</div>
                    </div>
                    <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
                      <label className="text-[0.9rem] font-semibold text-gray-400 uppercase tracking-[0.5px]">Business Address</label>
                      <div className="text-[1.1rem] font-semibold text-gray-800 py-3 px-4 bg-gray-50 rounded-[10px] border-2 border-gray-200">{getBizField('address')}</div>
                    </div>
                  </>
                )}
              </div>
              <button 
                className="self-center w-full md:w-auto bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none py-4 md:py-4 px-10 rounded-xl text-[1.1rem] font-semibold cursor-pointer transition-all duration-300 shadow-[0_4px_15px_rgba(102,126,234,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(102,126,234,0.4)]" 
                onClick={() => setIsEditing(true)}
              >
                ✏️ Edit Profile
              </button>
            </div>
          ) : (
            // Edit Mode
            <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[0.95rem] font-semibold text-gray-700">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="Enter first name"
                    className="py-[0.85rem] px-4 border-2 border-gray-200 rounded-[10px] text-[1rem] bg-white transition-all duration-200 focus:outline-none focus:border-[#667eea] focus:ring-[3px] focus:ring-[#667eea]/10"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[0.95rem] font-semibold text-gray-700">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    placeholder="Enter last name"
                    className="py-[0.85rem] px-4 border-2 border-gray-200 rounded-[10px] text-[1rem] bg-white transition-all duration-200 focus:outline-none focus:border-[#667eea] focus:ring-[3px] focus:ring-[#667eea]/10"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[0.95rem] font-semibold text-gray-700">Email</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="py-[0.85rem] px-4 border-2 rounded-[10px] text-[1rem] transition-all duration-200 bg-transparent border-gray-200 text-gray-400 cursor-not-allowed"
                  />
                  <small className="text-[0.85rem] text-gray-400">Email cannot be changed</small>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[0.95rem] font-semibold text-gray-700">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="Enter phone number"
                    className="py-[0.85rem] px-4 border-2 border-gray-200 rounded-[10px] text-[1rem] bg-white transition-all duration-200 focus:outline-none focus:border-[#667eea] focus:ring-[3px] focus:ring-[#667eea]/10"
                  />
                </div>

                {user.role === 'seller' && (
                  <>
                    <div className="col-span-1 md:col-span-2 mt-4 pt-4 border-t border-gray-200">
                      <h3 className="text-xl font-bold text-gray-800 m-0">Business Information</h3>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[0.95rem] font-semibold text-gray-700">Business Name</label>
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        placeholder="Business Name"
                        className="py-[0.85rem] px-4 border-2 border-gray-200 rounded-[10px] text-[1rem] bg-white transition-all duration-200 focus:outline-none focus:border-[#667eea] focus:ring-[3px] focus:ring-[#667eea]/10"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[0.95rem] font-semibold text-gray-700">Business Email</label>
                      <input
                        type="email"
                        name="businessEmail"
                        value={formData.businessEmail}
                        onChange={handleChange}
                        placeholder="Business Email"
                        className="py-[0.85rem] px-4 border-2 border-gray-200 rounded-[10px] text-[1rem] bg-white transition-all duration-200 focus:outline-none focus:border-[#667eea] focus:ring-[3px] focus:ring-[#667eea]/10"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[0.95rem] font-semibold text-gray-700">Business Phone</label>
                      <input
                        type="tel"
                        name="businessPhone"
                        value={formData.businessPhone}
                        onChange={handleChange}
                        placeholder="Business Phone"
                        className="py-[0.85rem] px-4 border-2 border-gray-200 rounded-[10px] text-[1rem] bg-white transition-all duration-200 focus:outline-none focus:border-[#667eea] focus:ring-[3px] focus:ring-[#667eea]/10"
                      />
                    </div>
                    <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
                      <label className="text-[0.95rem] font-semibold text-gray-700">Business Address</label>
                      <input
                        type="text"
                        name="businessAddress"
                        value={formData.businessAddress}
                        onChange={handleChange}
                        placeholder="Business Address"
                        className="py-[0.85rem] px-4 border-2 border-gray-200 rounded-[10px] text-[1rem] bg-white transition-all duration-200 focus:outline-none focus:border-[#667eea] focus:ring-[3px] focus:ring-[#667eea]/10"
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="flex flex-col md:flex-row gap-4 justify-center mt-4">
                <button 
                  type="submit" 
                  className="w-full md:w-auto bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none py-4 px-10 rounded-xl text-[1.05rem] font-semibold cursor-pointer transition-all duration-300 shadow-[0_4px_15px_rgba(102,126,234,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(102,126,234,0.4)] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none" 
                  disabled={loading}
                >
                  {loading ? '💾 Saving...' : '💾 Save Changes'}
                </button>
                <button 
                  type="button" 
                  className="w-full md:w-auto bg-gray-50 text-gray-600 border-2 border-gray-200 py-4 px-10 rounded-xl text-[1.05rem] font-semibold cursor-pointer transition-all duration-300 hover:bg-gray-200 hover:border-gray-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
                  onClick={handleCancel} 
                  disabled={loading}
                >
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