import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/api';
import { useToast } from '../../Hooks/useToast';
import Navbar from '../../Components/Layout/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import car1 from '../../images/car1';
import car2 from '../../images/car2';
import car3 from '../../images/car3';
import 'react-phone-number-input/style.css'; 

// Bug #11 fix: defined outside component so the array reference is stable
const SLIDESHOW_IMAGES = [car1, car2, car3];

const SignIn = ({ onSwitchToSignUp, onLoginSuccess }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'customer' // Default to customer
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % SLIDESHOW_IMAGES.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // Function to detect role based on email
  const detectRoleFromEmail = (email) => {
    if (email.includes('admin') || email.startsWith('admin@') || email === 'admin@carcraze.com') {
      return 'admin';
    } else if (email.includes('seller') || email.startsWith('seller@') || email.includes('testseller')) {
      return 'seller';
    } else {
      return 'customer';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Auto-detect role when email changes
    if (name === 'email') {
      const detectedRole = detectRoleFromEmail(value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        role: detectedRole
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      console.log('Attempting to sign in with:', { email: formData.email, role: formData.role });

      const response = await fetch(API_ENDPOINTS.SIGNIN, {
        method: 'POST',
        credentials: 'include', 
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text || 'Unknown error occurred' };
      }

      if (response.ok) {
        // Store user data in localStorage for quick access
        localStorage.setItem('user', JSON.stringify(data.user));

        if (onLoginSuccess) await onLoginSuccess();

        // Show success message
        toast.success(`👋 Welcome back, ${data.user.firstName}!`);

        // Redirect based on role
        if (data.user.role === 'seller') {
          navigate('/seller/dashboard');
        } else if (data.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setErrors({ general: data.message || 'Login failed' });
      }

    } catch (error) {
      console.error('Network error during login:', error);
      setErrors({ general: 'Network error. Please check if the server is running and try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Bug #5 fix: Google/Facebook OAuth is not yet implemented.
  const handleGoogleSignIn = () => {
    toast.info('🚧 Google Sign-In coming soon! Please use email & password for now.');
  };

  const handleFacebookSignIn = () => {
    toast.info('🚧 Facebook Sign-In coming soon! Please use email & password for now.');
  };

  return (
    <>
      <Navbar />
      <div className="relative min-h-screen w-full flex items-start justify-center pt-28 pb-6 px-5 overflow-auto font-sans">
        
        {/* Background slideshow layer */}
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
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
        <div className="relative z-20 bg-white border border-gray-50 rounded-2xl shadow-[0_24px_48px_rgba(31,41,55,0.15)] p-7 sm:p-9 w-full max-w-[420px] transition-all transform opacity-100 translate-y-0">
          
          <div className="text-center mb-7">
            <h2 className="text-gray-900 text-3xl font-extrabold tracking-tight mb-1.5">Welcome Back</h2>
            <p className="text-gray-500 text-[15px] m-0 after:content-['BUILD_TO_MOVE_YOU'] after:block after:mt-2.5 after:text-[12px] after:tracking-[2px] after:font-bold after:text-amber-500">
              Sign in to access your CarCraze account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-[14px]">
            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-gray-800 font-semibold text-xs">Email Address</label>
              <div className="relative flex items-center">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full py-3 pl-4 pr-10 border-[1.5px] rounded-xl text-base bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:border-blue-300 focus:ring-blue-500/15 ${errors.email ? 'border-red-500 shadow-[0_0_0_3px_rgba(229,62,62,0.1)]' : 'border-gray-200'}`}
                  placeholder="Enter your email address"
                  autoComplete="email"
                />
                <FontAwesomeIcon icon={faEnvelope} className="absolute right-4 text-gray-400 text-base pointer-events-none" />
              </div>
              {errors.email && <span className="text-red-500 text-sm font-medium">{errors.email}</span>}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-gray-800 font-semibold text-xs">Password</label>
              <div className="relative flex items-center">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full py-3 pl-4 pr-10 border-[1.5px] rounded-xl text-base bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:border-blue-300 focus:ring-blue-500/15 ${errors.password ? 'border-red-500 shadow-[0_0_0_3px_rgba(229,62,62,0.1)]' : 'border-gray-200'}`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <FontAwesomeIcon icon={faLock} className="absolute right-4 text-gray-400 text-base pointer-events-none" />
              </div>
              {errors.password && <span className="text-red-500 text-sm font-medium">{errors.password}</span>}
            </div>

            {errors.general && (
              <div className="bg-red-100 border border-red-200 rounded-lg p-3 text-center text-red-600 text-sm font-medium">
                {errors.general}
              </div>
            )}

            {/* Form Options */}
            <div className="flex justify-between items-center my-1">
              <button
                type="button"
                className="bg-transparent border-none text-indigo-600 text-sm cursor-pointer underline p-0 hover:text-indigo-700 ml-auto"
                onClick={() => navigate('/forgot-password')}
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="relative overflow-hidden w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white border-none rounded-xl py-3.5 px-6 text-base font-bold cursor-pointer transition-all duration-200 hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(37,99,235,0.35)] active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center justify-center gap-3 text-gray-400 font-semibold my-1.5 before:flex-1 before:h-px before:bg-gray-200 after:flex-1 after:h-px after:bg-gray-200">
              or
            </div>

            {/* Google Sign-In */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2.5 bg-white text-gray-800 border-2 border-gray-200 rounded-xl py-3 px-4 font-semibold cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:border-gray-300 hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(0,0,0,0.06)]"
              onClick={handleGoogleSignIn}
              disabled={loading}
              aria-label="Continue with Google"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20" className="shrink-0" aria-hidden="true">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C33.049,6.053,28.761,4,24,4C12.955,4,4,12.955,4,24 s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,16.108,18.961,13,24,13c3.059,0,5.842,1.154,7.961,3.039 l5.657-5.657C33.049,6.053,28.761,4,24,4C16.318,4,9.656,8.338,6.306,14.691z" />
                <path fill="#4CAF50" d="M24,44c4.717,0,9.005-1.807,12.247-4.747l-5.657-5.657C28.515,35.994,26.38,37,24,37 c-5.202,0-9.617-3.317-11.278-7.946l-6.5,5.005C8.505,39.556,15.717,44,24,44z" />
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.793,2.237-2.231,4.166-4.057,5.596 c0.001-0.001,0.002-0.001,0.003-0.002l5.657,5.657C35.697,40.087,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
              </svg>
              Continue with Google
            </button>

            {/* Facebook Sign-In */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2.5 bg-[#1877F2] text-white border-2 border-[#1877F2] rounded-xl py-3 px-4 font-semibold cursor-pointer transition-all duration-200 hover:bg-[#166FE5] hover:border-[#166FE5] hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(22,111,229,0.35)]"
              onClick={handleFacebookSignIn}
              disabled={loading}
              aria-label="Continue with Facebook"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" className="shrink-0" aria-hidden="true">
                <path fill="#1877F2" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078V12.07h3.047V9.412c0-3.007 1.792-4.668 4.533-4.668 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.493 0-1.957.93-1.957 1.887v2.25h3.328l-.532 3.492h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
                <path fill="#fff" d="M16.671 15.562l.532-3.492h-3.328v-2.25c0-.957.464-1.887 1.957-1.887h1.513V4.98s-1.374-.235-2.686-.235c-2.741 0-4.533 1.661-4.533 4.668v2.658H7.078v3.493h3.047V24h3.75v-8.437h2.796z" />
              </svg>
              Continue with Facebook
            </button>
          </form>

          {/* Footer Link to Sign Up */}
          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <p className="text-gray-500 text-sm m-0">
              Don't have an account?{' '}
              <button onClick={() => navigate('/signup')} className="bg-transparent border-none text-indigo-600 font-semibold cursor-pointer p-0 hover:underline">
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default SignIn;