import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import './SignUp.css';
import Navbar from '../Common/Navbar';
import car1 from '../../images/car1';
import car2 from '../../images/car2';
import car3 from '../../images/car3';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faUser, faLock, faPhone, faBuilding, faMapMarkerAlt, faUserShield, faKey } from '@fortawesome/free-solid-svg-icons';


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
    businessEmail: '',
    businessAddress: '',
    businessPhone: '',
    // Additional fields for admins
    adminCode: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const images = [car1, car2, car3];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(id);
  }, [images.length]);

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
      // Format the request body for sellers
      let requestBody = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role
      };

      // Add business info for sellers
      if (formData.role === 'seller') {
        requestBody.businessInfo = {
          name: formData.businessName,
          email: formData.businessEmail,
          phone: formData.businessPhone,
          address: formData.businessAddress
        };
      }

      // Add admin code for admins
      if (formData.role === 'admin') {
        requestBody.adminCode = formData.adminCode;
      }

  const response = await fetch(API_ENDPOINTS.SIGNUP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
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
            <div className="input-with-icon">
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                className={errors.businessName ? 'error' : ''}
                placeholder="Enter your business name"
              />
              <FontAwesomeIcon icon={faBuilding} className="input-icon" />
            </div>
            {errors.businessName && <span className="error-message">{errors.businessName}</span>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="businessEmail">Business Email *</label>
              <div className="input-with-icon">
                <input
                  type="email"
                  id="businessEmail"
                  name="businessEmail"
                  value={formData.businessEmail}
                  onChange={handleInputChange}
                  className={errors.businessEmail ? 'error' : ''}
                  placeholder="Enter your business email"
                />
                <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
              </div>
              {errors.businessEmail && (
                <span className="error-message">{errors.businessEmail}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="businessPhone">Business Phone *</label>
              <div className="input-with-icon">
                <input
                  type="tel"
                  id="businessPhone"
                  name="businessPhone"
                  value={formData.businessPhone}
                  onChange={handleInputChange}
                  className={errors.businessPhone ? 'error' : ''}
                  placeholder="Enter business phone"
                />
                <FontAwesomeIcon icon={faPhone} className="input-icon" />
              </div>
              {errors.businessPhone && <span className="error-message">{errors.businessPhone}</span>}
            </div>
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

        </>
      );
    }

    if (formData.role === 'admin') {
      return (
        <div className="form-group">
          <label htmlFor="adminCode">Admin Code *</label>
          <div className="input-with-icon">
            <input
              type="password"
              id="adminCode"
              name="adminCode"
              value={formData.adminCode}
              onChange={handleInputChange}
              className={errors.adminCode ? 'error' : ''}
              placeholder="Enter admin verification code"
            />
            <FontAwesomeIcon icon={faUserShield} className="input-icon" />
          </div>
          {errors.adminCode && <span className="error-message">{errors.adminCode}</span>}
          <small className="help-text">Contact system administrator for the admin code</small>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <Navbar />
      <div
        className="auth-container"
      >
        <div className="auth-bg">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`auth-bg-image ${idx === currentImageIndex ? 'active' : ''}`}
              style={{ backgroundImage: `url(${img})` }}
            />
          ))}
          <div className="auth-overlay" />
        </div>
        <div className="auth-card">
          <div className="auth-header">
            <h2>Join CarCraze</h2>
            <h4>Create your account and start your journey</h4>
            <h5>BUILD TO MOVE YOU</h5>
          </div>

          <form onSubmit={handleSubmit} className={`auth-form ${formData.role === 'seller' ? 'seller-form' : ''}`}>
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

            {/* Name Fields */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <div className="input-with-icon">
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={errors.firstName ? 'error' : ''}
                    placeholder="Enter your first name"
                  />
                  <FontAwesomeIcon icon={faUser} className="input-icon" />
                </div>
                {errors.firstName && <span className="error-message">{errors.firstName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <div className="input-with-icon">
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={errors.lastName ? 'error' : ''}
                    placeholder="Enter your last name"
                  />
                  <FontAwesomeIcon icon={faUser} className="input-icon" />
                </div>
                {errors.lastName && <span className="error-message">{errors.lastName}</span>}
              </div>
            </div>

            <div className="form-row">
              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <div className="input-with-icon">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'error' : ''}
                    placeholder="Enter email address"
                  />
                  <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                </div>
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
              {/* Phone Field */}
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <div className="input-with-icon">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={errors.phone ? 'error' : ''}
                    placeholder="Enter phone number"
                  />
                  <FontAwesomeIcon icon={faPhone} className="input-icon" />
                </div>
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>
            </div>


            {/* Password Fields */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <div className="input-with-icon">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={errors.password ? 'error' : ''}
                    placeholder="Create password"
                  />
                  <FontAwesomeIcon icon={faLock} className="input-icon" />
                </div>
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <div className="input-with-icon">
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={errors.confirmPassword ? 'error' : ''}
                    placeholder="Confirm password"
                  />
                  <FontAwesomeIcon icon={faLock} className="input-icon" />
                </div>
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>
            </div>
            {/* Role-specific fields */}
            {renderRoleSpecificFields()}

            {errors.general && (
              <div className="error-message general-error">
                {errors.general}
              </div>
            )}

            <button
              type="submit"
              className={`auth-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <button onClick={onSwitchToSignIn} className="link-btn">
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
export default SignUp;
