import React, { useState } from 'react';
import './SignIn.css';

const SignIn = ({ onSwitchToSignUp }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Function to detect role based on email
  const detectRoleFromEmail = (email) => {
    if (email.includes('admin') || email.startsWith('admin@') || email === 'admin@carcraze.com') {
      return 'admin';
    } else if (email.includes('seller') || email.startsWith('seller@') || email === 'seller@carcraze.com') {
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
            // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Here you would typically make an API call to authenticate the user
      console.log('Login data:', formData);
      
      // Simulate different responses based on role
      const roleMessages = {
        customer: 'Welcome back! Redirecting to car listings...',
        seller: 'Welcome back! Redirecting to your dashboard...',
        admin: 'Admin access granted. Redirecting to admin panel...'
      };
      
      alert(roleMessages[formData.role]);
      
      // In a real app, you would:

      // let response;
      
      // if (authMode === 'password') {
      //   response = await fetch('/api/auth/signin', {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({
      //       email: formData.email,
      //       password: formData.password
      //     })
      //   });
      // } else {
      //   response = await fetch('/api/auth/verify-otp', {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({
      //       email: formData.email,
      //       otp: formData.otp
      //     })
      //   });
      // }

      // const data = await response.json();

      // if (response.ok) {
      //   alert(`${data.user.role.charAt(0).toUpperCase() + data.user.role.slice(1)} logged in successfully!`);
      //   localStorage.setItem('token', data.token);
      //   localStorage.setItem('user', JSON.stringify(data.user));
      // } else {
      //   alert(data.message || 'Login failed');
      // }
      
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Invalid credentials. Please try again.' });
    } finally {
      setLoading(false);
    }
  };
  

  const handleForgotPassword = async (email) => {
    if (!email.trim()) {
      alert('Please enter your email address');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      // Simulate API call for password reset
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Password reset link sent to your email!');
      setShowForgotPassword(false);
    } catch (error) {
      alert('Failed to send reset link. Please try again.');
    }
  };

  const getRoleDescription = (role) => {
    const descriptions = {
      customer: 'Access car listings and make purchases',
      seller: 'Manage your car inventory and sales',
      admin: 'Full platform management access'
    };
    return descriptions[role];
  };

  const getRoleIcon = (role) => {
    const icons = {
      customer: '🚗',
      seller: '🏪',
      admin: '⚙️'
    };
    return icons[role];
  };

  if (showForgotPassword) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Reset Password</h2>
            <p>Enter your email to receive a reset link</p>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            handleForgotPassword(formData.email);
          }} className="auth-form">
            <div className="form-group">
              <label htmlFor="resetEmail">Email Address</label>
              <input
                type="email"
                id="resetEmail"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                autoFocus
              />
            </div>

            <button type="submit" className="auth-button">
              Send Reset Link
            </button>

            <button 
              type="button" 
              className="auth-button secondary"
              onClick={() => setShowForgotPassword(false)}
            >
              Back to Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your CarCraze account</p>
        </div>


        <form onSubmit={handleSubmit} className="auth-form">
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? 'error' : ''}
              placeholder="Enter your email address"
              autoComplete="email"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={errors.password ? 'error' : ''}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>


          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}

          {/* Form Options */}
          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span className="checkmark"></span>
              Remember me
            </label>
            
            <button
              type="button"
              className="forgot-password-link"
              onClick={() => setShowForgotPassword(true)}
            >
              Forgot Password?
            </button>
          </div>

          <button 
            type="submit" 
            className={`auth-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Signing In...' : `Sign In as ${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}`}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <button className="link-btn" onClick={onSwitchToSignUp}>Create Account</button></p>
        </div>

      </div>
    </div>
  );
};

export default SignIn;