import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Layout/Navbar';
import car1 from '../../images/car1';
import car2 from '../../images/car2';
import car3 from '../../images/car3';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faUser, faLock, faPhone, faBuilding, faMapMarkerAlt, faUserShield } from '@fortawesome/free-solid-svg-icons';
import { useToast } from '../../Hooks/useToast';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css'; 

const SLIDESHOW_IMAGES = [car1, car2, car3];

const SignUp = ({ onSwitchToSignIn }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'customer',
    businessName: '',
    businessEmail: '',
    businessAddress: '',
    businessPhone: '',
    adminCode: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % SLIDESHOW_IMAGES.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

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

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!isValidPhoneNumber(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

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
      let requestBody = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role
      };

      if (formData.role === 'seller') {
        requestBody.businessInfo = {
          name: formData.businessName,
          email: formData.businessEmail,
          phone: formData.businessPhone,
          address: formData.businessAddress
        };
      }

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
        toast.error(data.message || "Registration failed");
      } else {
        toast.success(`🎉 ${data.user.role.charAt(0).toUpperCase() + data.user.role.slice(1)} account created successfully!`);
        navigate('/signin');
      }

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
      toast.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Shared input class styles for perfect consistency
  const inputClass = (errorField) => 
    `w-full py-2.5 pl-3 pr-9 border-[1.5px] rounded-xl text-[13px] bg-white transition-all duration-200 focus:outline-none focus:ring-[3px] ${
      errorField 
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15 shadow-[0_0_0_3px_rgba(229,62,62,0.1)]' 
        : 'border-gray-200 focus:border-blue-400 focus:ring-blue-500/15'
    }`;

  const renderRoleSpecificFields = () => {
    if (formData.role === 'seller') {
      return (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="businessName" className="text-gray-800 font-semibold text-xs">Business Name *</label>
            <div className="relative flex items-center">
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                className={inputClass(errors.businessName)}
                placeholder="Enter your business name"
              />
              <FontAwesomeIcon icon={faBuilding} className="absolute right-3 text-gray-400 text-sm pointer-events-none" />
            </div>
            {errors.businessName && <span className="text-red-500 text-xs font-medium mt-0.5">{errors.businessName}</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="businessEmail" className="text-gray-800 font-semibold text-xs">Business Email *</label>
              <div className="relative flex items-center">
                <input
                  type="email"
                  id="businessEmail"
                  name="businessEmail"
                  value={formData.businessEmail}
                  onChange={handleInputChange}
                  className={inputClass(errors.businessEmail)}
                  placeholder="Enter business email"
                />
                <FontAwesomeIcon icon={faEnvelope} className="absolute right-3 text-gray-400 text-sm pointer-events-none" />
              </div>
              {errors.businessEmail && <span className="text-red-500 text-xs font-medium mt-0.5">{errors.businessEmail}</span>}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="businessPhone" className="text-gray-800 font-semibold text-xs">Business Phone *</label>
              <div className="relative flex items-center bg-white rounded-xl">
                <PhoneInput
                  id="businessPhone"
                  name="businessPhone"
                  defaultCountry="IN"
                  placeholder="Enter business phone"
                  value={formData.businessPhone}
                  onChange={(value) => handleInputChange({ target: { name: 'businessPhone', value } })}
                  className={`flex items-center w-full [&>input]:w-full [&>input]:border-none [&>input]:outline-none [&>input]:pl-2 [&>input]:bg-transparent ${inputClass(errors.businessPhone)}`}
                />
                <FontAwesomeIcon icon={faPhone} className="absolute right-3 text-gray-400 text-sm pointer-events-none bg-white pl-1" />
              </div>
              {errors.businessPhone && <span className="text-red-500 text-xs font-medium mt-0.5">{errors.businessPhone}</span>}
            </div>
          </div>

          <div className="flex flex-col gap-1 mb-1">
            <label htmlFor="businessAddress" className="text-gray-800 font-semibold text-xs">Business Address *</label>
            <div className="relative flex items-start">
              <textarea
                id="businessAddress"
                name="businessAddress"
                value={formData.businessAddress}
                onChange={handleInputChange}
                className={`${inputClass(errors.businessAddress)} resize-y min-h-[80px] py-3 pr-3`}
                placeholder="Enter your business address"
                rows="3"
              />
            </div>
            {errors.businessAddress && <span className="text-red-500 text-xs font-medium mt-0.5">{errors.businessAddress}</span>}
          </div>
        </div>
      );
    }

    if (formData.role === 'admin') {
      return (
        <div className="flex flex-col gap-1 mb-2">
          <label htmlFor="adminCode" className="text-gray-800 font-semibold text-xs">Admin Code *</label>
          <div className="relative flex items-center">
            <input
              type="password"
              id="adminCode"
              name="adminCode"
              value={formData.adminCode}
              onChange={handleInputChange}
              className={inputClass(errors.adminCode)}
              placeholder="Enter admin verification code"
            />
            <FontAwesomeIcon icon={faUserShield} className="absolute right-3 text-gray-400 text-sm pointer-events-none" />
          </div>
          {errors.adminCode && <span className="text-red-500 text-xs font-medium mt-0.5">{errors.adminCode}</span>}
          <small className="text-gray-500 text-xs italic mt-1">Contact system administrator for the admin code</small>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <Navbar />
      <div className="relative min-h-screen w-full flex items-start justify-center pt-28 pb-6 px-5 overflow-auto font-sans">
        
        {/* Background slideshow layer */}
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0 fixed">
          {SLIDESHOW_IMAGES.map((img, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-700 ease-in-out ${idx === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
              style={{ backgroundImage: `url(${img})` }}
            />
          ))}
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/20 z-10" />
        </div>

        {/* Auth Card */}
        <div className="relative z-20 bg-white border border-gray-50 rounded-2xl shadow-[0_24px_48px_rgba(31,41,55,0.15)] p-6 sm:p-8 w-full max-w-[500px] transition-all transform opacity-100 translate-y-0 my-auto">
          
          <div className="text-center mb-6">
            <h2 className="text-gray-900 text-3xl font-extrabold tracking-tight mb-1.5">Join CarCraze</h2>
            <p className="text-gray-500 text-[14px] m-0 after:content-['BUILD_TO_MOVE_YOU'] after:block after:mt-2 after:text-[11px] after:tracking-[2px] after:font-bold after:text-amber-500">
              Create your account and start your journey
            </p>
          </div>

          <form 
            onSubmit={handleSubmit} 
            className={`flex flex-col gap-3.5 text-[14px] ${formData.role === 'seller' ? 'max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar' : ''}`}
            style={formData.role === 'seller' ? { scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9' } : {}}
          >
            {/* Role Selection */}
            <div className="flex flex-col gap-1 mb-1">
              <label htmlFor="role" className="text-gray-800 font-semibold text-xs">Account Type *</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full py-2.5 px-3 border-2 border-gray-200 rounded-xl text-[13px] font-medium text-gray-700 bg-white transition-all duration-200 focus:outline-none focus:border-blue-400 focus:ring-[3px] focus:ring-blue-500/15 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[position:calc(100%-12px)_center] bg-no-repeat pr-10"
              >
                <option value="customer">Customer - Buy cars</option>
                <option value="seller">Seller - Sell cars</option>
                <option value="admin">Admin - Manage platform</option>
              </select>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="firstName" className="text-gray-800 font-semibold text-xs">First Name *</label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={inputClass(errors.firstName)}
                    placeholder="Enter your first name"
                  />
                  <FontAwesomeIcon icon={faUser} className="absolute right-3 text-gray-400 text-sm pointer-events-none" />
                </div>
                {errors.firstName && <span className="text-red-500 text-xs font-medium mt-0.5">{errors.firstName}</span>}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="lastName" className="text-gray-800 font-semibold text-xs">Last Name *</label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={inputClass(errors.lastName)}
                    placeholder="Enter your last name"
                  />
                  <FontAwesomeIcon icon={faUser} className="absolute right-3 text-gray-400 text-sm pointer-events-none" />
                </div>
                {errors.lastName && <span className="text-red-500 text-xs font-medium mt-0.5">{errors.lastName}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Email Field */}
              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="text-gray-800 font-semibold text-xs">Email Address *</label>
                <div className="relative flex items-center">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={inputClass(errors.email)}
                    placeholder="Enter email address"
                  />
                  <FontAwesomeIcon icon={faEnvelope} className="absolute right-3 text-gray-400 text-sm pointer-events-none" />
                </div>
                {errors.email && <span className="text-red-500 text-xs font-medium mt-0.5">{errors.email}</span>}
              </div>
              
              {/* Phone Field */}
              <div className="flex flex-col gap-1">
                <label htmlFor="phone" className="text-gray-800 font-semibold text-xs">Phone Number *</label>
                <div className="relative flex items-center bg-white rounded-xl">
                  <PhoneInput
                    id="phone"
                    name="phone"
                    defaultCountry="IN"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(value) => handleInputChange({ target: { name: 'phone', value } })}
                    className={`flex items-center w-full [&>input]:w-full [&>input]:border-none [&>input]:outline-none [&>input]:pl-2 [&>input]:bg-transparent ${inputClass(errors.phone)}`}
                  />
                  <FontAwesomeIcon icon={faPhone} className="absolute right-3 text-gray-400 text-sm pointer-events-none bg-white pl-1" />
                </div>
                {errors.phone && <span className="text-red-500 text-xs font-medium mt-0.5">{errors.phone}</span>}
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-1">
              <div className="flex flex-col gap-1">
                <label htmlFor="password" className="text-gray-800 font-semibold text-xs">Password *</label>
                <div className="relative flex items-center">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={inputClass(errors.password)}
                    placeholder="Create password"
                  />
                  <FontAwesomeIcon icon={faLock} className="absolute right-3 text-gray-400 text-sm pointer-events-none" />
                </div>
                {errors.password && <span className="text-red-500 text-xs font-medium mt-0.5">{errors.password}</span>}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="confirmPassword" className="text-gray-800 font-semibold text-xs">Confirm Password *</label>
                <div className="relative flex items-center">
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={inputClass(errors.confirmPassword)}
                    placeholder="Confirm password"
                  />
                  <FontAwesomeIcon icon={faLock} className="absolute right-3 text-gray-400 text-sm pointer-events-none" />
                </div>
                {errors.confirmPassword && <span className="text-red-500 text-xs font-medium mt-0.5">{errors.confirmPassword}</span>}
              </div>
            </div>

            {/* Role-specific fields */}
            {renderRoleSpecificFields()}

            {errors.general && (
              <div className="bg-red-100 border border-red-200 rounded-lg p-3 text-center text-red-600 text-[13px] font-medium mt-1">
                {errors.general}
              </div>
            )}

            <button
              type="submit"
              className="relative overflow-hidden w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white border-none rounded-xl py-3 px-6 mt-2 text-[15px] font-bold cursor-pointer transition-all duration-200 hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(37,99,235,0.35)] active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Footer Link to Sign In */}
          <div className="text-center mt-5 pt-5 border-t border-gray-100">
            <p className="text-gray-500 text-[13px] m-0">
              Already have an account?{' '}
              <button 
                onClick={onSwitchToSignIn || (() => navigate('/signin'))} 
                className="bg-transparent border-none text-indigo-600 font-bold cursor-pointer p-0 hover:underline"
              >
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