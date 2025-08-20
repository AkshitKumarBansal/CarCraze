import React, { useState } from 'react';
import './SignUp.css';

const SignUp = ({ onSwitchToSignIn }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'customer',
    // Additional fields for sellers
    businessName: '',
    businessAddress: '',
    businessPhone: '',
    // Additional fields for admins
    adminCode: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Basic validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    // Role-specific validation
    if (formData.role === 'seller') {
      if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
      if (!formData.businessAddress.trim()) newErrors.businessAddress = 'Business address is required';
      if (!formData.businessPhone.trim()) newErrors.businessPhone = 'Business phone is required';
    }
    
    if (formData.role === 'admin') {
      if (!formData.adminCode.trim()) {
        newErrors.adminCode = 'Admin code is required';
      } else if (formData.adminCode !== 'CARCRAZE_ADMIN_2024') {
        newErrors.adminCode = 'Invalid admin code';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) return;
    setLoading(true);
  
    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        alert(data.message || "Registration failed");
      } else {
        alert(`${data.user.role} registered successfully!`);
      }
  
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        role: "customer",
        businessName: "",
        businessAddress: "",
        businessPhone: "",
        adminCode: "",
      });
  
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderRoleSpecificFields = () => {
    if (formData.role === 'seller') {
      return (
        <>
          <div className="form-group">
            <label htmlFor="businessName">Business Name *</label>
            <input
              type="text"
              id="businessName"
              name="businessName"
              value={formData.businessName}
              onChange={handleInputChange}
              className={errors.businessName ? 'error' : ''}
              placeholder="Enter your business name"
            />
            {errors.businessName && <span className="error-message">{errors.businessName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="businessAddress">Business Address *</label>
            <textarea
              id="businessAddress"
              name="businessAddress"
              value={formData.businessAddress}
              onChange={handleInputChange}
              className={errors.businessAddress ? 'error' : ''}
              placeholder="Enter your business address"
              rows="3"
            />
            {errors.businessAddress && <span className="error-message">{errors.businessAddress}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="businessPhone">Business Phone *</label>
            <input
              type="tel"
              id="businessPhone"
              name="businessPhone"
              value={formData.businessPhone}
              onChange={handleInputChange}
              className={errors.businessPhone ? 'error' : ''}
              placeholder="Enter business phone number"
            />
            {errors.businessPhone && <span className="error-message">{errors.businessPhone}</span>}
          </div>
        </>
      );
    }

    if (formData.role === 'admin') {
      return (
        <div className="form-group">
          <label htmlFor="adminCode">Admin Code *</label>
          <input
            type="password"
            id="adminCode"
            name="adminCode"
            value={formData.adminCode}
            onChange={handleInputChange}
            className={errors.adminCode ? 'error' : ''}
            placeholder="Enter admin verification code"
          />
          {errors.adminCode && <span className="error-message">{errors.adminCode}</span>}
          <small className="help-text">Contact system administrator for the admin code</small>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join CarCraze today</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Role Selection */}
          <div className="form-group">
            <label htmlFor="role">Account Type *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="role-select"
            >
              <option value="customer">Customer - Buy cars</option>
              <option value="seller">Seller - Sell cars</option>
              <option value="admin">Admin - Manage platform</option>
            </select>
          </div>

          {/* Basic Information */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={errors.firstName ? 'error' : ''}
                placeholder="Enter first name"
              />
              {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={errors.lastName ? 'error' : ''}
                placeholder="Enter last name"
              />
              {errors.lastName && <span className="error-message">{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? 'error' : ''}
              placeholder="Enter email address"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={errors.phone ? 'error' : ''}
              placeholder="Enter phone number"
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? 'error' : ''}
                placeholder="Enter password"
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? 'error' : ''}
                placeholder="Confirm password"
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          </div>

          {/* Role-specific fields */}
          {renderRoleSpecificFields()}

          <button 
            type="submit" 
            className={`auth-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <button className="link-btn" onClick={onSwitchToSignIn}>Sign In</button></p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;