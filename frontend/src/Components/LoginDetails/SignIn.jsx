import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignIn.css';
import Navbar from '../Common/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import car1 from '../../images/car1';
import car2 from '../../images/car2';
import car3 from '../../images/car3';

const SignIn = ({ onSwitchToSignUp }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'customer' // Default to customer
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const images = [car1, car2, car3];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(id);
  }, [images.length]);

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
      
      const response = await fetch('http://localhost:5000/api/auth/signin', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        // Store authentication data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('User role:', data.user.role);
        
        // Show success message
        alert(`Welcome back, ${data.user.firstName}!`);
        
        // Redirect based on role
        if (data.user.role === 'seller') {
          console.log('Redirecting to seller dashboard...');
          navigate('/seller/dashboard');
        } else if (data.user.role === 'admin') {
          console.log('Redirecting to admin dashboard...');
          navigate('/admin/dashboard');
        } else {
          console.log('Redirecting to home...');
          navigate('/');
        }
      } else {
        console.error('Login failed:', data);
        setErrors({ general: data.message || 'Login failed' });
      }
      
    } catch (error) {
      console.error('Network error during login:', error);
      setErrors({ general: 'Network error. Please check if the server is running and try again.' });
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

  // Simulated Google Sign-In handler
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      // Simulate Google auth popup + response
      await new Promise(resolve => setTimeout(resolve, 1200));

      // If email already typed, infer role; else use a demo email
      const email = formData.email?.trim() || 'customer@carcraze.com';
      const role = detectRoleFromEmail(email);

      alert(`Signed in with Google as ${role.charAt(0).toUpperCase() + role.slice(1)} (${email}). Redirecting...`);
      
      // Redirect based on role
      if (role === 'seller') {
        navigate('/seller/dashboard');
      } else if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Google sign-in failed:', err);
      setErrors({ general: 'Google sign-in failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Simulated Facebook Sign-In handler
  const handleFacebookSignIn = async () => {
    try {
      setLoading(true);
      // Simulate Facebook auth popup + response
      await new Promise(resolve => setTimeout(resolve, 1200));

      const email = formData.email?.trim() || 'customer@carcraze.com';
      const role = detectRoleFromEmail(email);

      alert(`Signed in with Facebook as ${role.charAt(0).toUpperCase() + role.slice(1)} (${email}). Redirecting...`);
      
      // Redirect based on role
      if (role === 'seller') {
        navigate('/seller/dashboard');
      } else if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Facebook sign-in failed:', err);
      setErrors({ general: 'Facebook sign-in failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <>
        <Navbar />
        <div className="auth-container">
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
            <h2>Reset Password</h2>
            <p>Enter your email to receive a reset link</p>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            handleForgotPassword(formData.email);
          }} className="auth-form">
            <div className="form-group">
              <label htmlFor="resetEmail">Email Address</label>
              <div className="input-with-icon">
                <input
                  type="email"
                  id="resetEmail"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  autoFocus
                />
                <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
              </div>
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
      </>
    );
  }

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
          <h2>Welcome Back</h2>
          <h4>Sign in to access your CarCraze account</h4>
          <h5>BUILD TO MOVE YOU</h5>
        </div>


        <form onSubmit={handleSubmit} className="auth-form">
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
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
              <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
            </div>
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
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
              <FontAwesomeIcon icon={faLock} className="input-icon" />
            </div>
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
            className={`auth-button small ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            Sign In
          </button>
        
          {/* Divider */}
          <div className="divider">or</div>

          {/* Google Sign-In */}
          <button
            type="button"
            className="oauth-btn google"
            onClick={handleGoogleSignIn}
            disabled={loading}
            aria-label="Continue with Google"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C33.049,6.053,28.761,4,24,4C12.955,4,4,12.955,4,24 s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,16.108,18.961,13,24,13c3.059,0,5.842,1.154,7.961,3.039 l5.657-5.657C33.049,6.053,28.761,4,24,4C16.318,4,9.656,8.338,6.306,14.691z"/>
              <path fill="#4CAF50" d="M24,44c4.717,0,9.005-1.807,12.247-4.747l-5.657-5.657C28.515,35.994,26.38,37,24,37 c-5.202,0-9.617-3.317-11.278-7.946l-6.5,5.005C8.505,39.556,15.717,44,24,44z"/>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.793,2.237-2.231,4.166-4.057,5.596 c0.001-0.001,0.002-0.001,0.003-0.002l5.657,5.657C35.697,40.087,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
            Continue with Google
          </button>

          {/* Facebook Sign-In */}
          <button
            type="button"
            className="oauth-btn facebook"
            onClick={handleFacebookSignIn}
            disabled={loading}
            aria-label="Continue with Facebook"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path fill="#1877F2" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078V12.07h3.047V9.412c0-3.007 1.792-4.668 4.533-4.668 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.493 0-1.957.93-1.957 1.887v2.25h3.328l-.532 3.492h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              <path fill="#fff" d="M16.671 15.562l.532-3.492h-3.328v-2.25c0-.957.464-1.887 1.957-1.887h1.513V4.98s-1.374-.235-2.686-.235c-2.741 0-4.533 1.661-4.533 4.668v2.658H7.078v3.493h3.047V24h3.75v-8.438h2.796z"/>
            </svg>
            Continue with Facebook
          </button>
        </form>
        </div>
      </div>
    </>
  );
}

export default SignIn;




// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Navbar from '../Common/Navbar';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
// import car1 from '../../images/car1';
// import car2 from '../../images/car2';
// import car3 from '../../images/car3';
// import './SignIn.css';

// const SignIn = ({ onSwitchToSignUp, setIsLoggedIn }) => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({ email: '', password: '', role: 'customer' });
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [showForgotPassword, setShowForgotPassword] = useState(false);

//   const images = [car1, car2, car3];
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);

//   // Carousel image rotation
//   useEffect(() => {
//     const id = setInterval(() => {
//       setCurrentImageIndex(prev => (prev + 1) % images.length);
//     }, 5000);
//     return () => clearInterval(id);
//   }, [images.length]);

//   // Detect role based on email
//   const detectRoleFromEmail = email => {
//     if (email.includes('admin')) return 'admin';
//     if (email.includes('seller')) return 'seller';
//     return 'customer';
//   };

//   const handleInputChange = e => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value,
//       ...(name === 'email' && { role: detectRoleFromEmail(value) })
//     }));
//     if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     if (!formData.email.trim()) newErrors.email = 'Email is required';
//     else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
//     if (!formData.password) newErrors.password = 'Password is required';
//     else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async e => {
//     e.preventDefault();
//     if (!validateForm()) return;

//     setLoading(true);
//     try {
//       // Simulate API login
//       const token = 'sample_token';
//       const user = { firstName: 'John', role: formData.role };

//       localStorage.setItem('token', token);
//       localStorage.setItem('user', JSON.stringify(user));

//       setIsLoggedIn(true); // ✅ update Navbar login state

//       // Redirect by role
//       if (user.role === 'seller') navigate('/seller/dashboard');
//       else if (user.role === 'admin') navigate('/admin/dashboard');
//       else navigate('/');

//       alert(`Welcome back, ${user.firstName}!`);
//     } catch (err) {
//       setErrors({ general: 'Login failed. Please try again.' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleForgotPassword = async email => {
//     if (!email.trim()) return alert('Please enter your email');
//     if (!/\S+@\S+\.\S+/.test(email)) return alert('Enter a valid email');

//     alert('Password reset link sent to your email!');
//     setShowForgotPassword(false);
//   };

//   const handleOAuthSignIn = async provider => {
//     setLoading(true);
//     try {
//       await new Promise(res => setTimeout(res, 1000)); // simulate OAuth API

//       const email = formData.email || 'customer@carcraze.com';
//       const role = detectRoleFromEmail(email);

//       localStorage.setItem('token', 'sample_token');
//       localStorage.setItem('user', JSON.stringify({ firstName: 'John', role }));

//       setIsLoggedIn(true); // update Navbar

//       if (role === 'seller') navigate('/seller/dashboard');
//       else if (role === 'admin') navigate('/admin/dashboard');
//       else navigate('/');

//       alert(`Signed in with ${provider} as ${role}`);
//     } catch (err) {
//       setErrors({ general: `${provider} sign-in failed` });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Forgot Password UI
//   if (showForgotPassword) {
//     return (
//       <>
//         <Navbar isLoggedIn={localStorage.getItem('token')} setIsLoggedIn={setIsLoggedIn} />
//         <div className="auth-container">
//           <div className="auth-bg">
//             {images.map((img, idx) => (
//               <div key={idx} className={`auth-bg-image ${idx === currentImageIndex ? 'active' : ''}`} style={{ backgroundImage: `url(${img})` }} />
//             ))}
//             <div className="auth-overlay" />
//           </div>
//           <div className="auth-card">
//             <h2>Reset Password</h2>
//             <form onSubmit={e => { e.preventDefault(); handleForgotPassword(formData.email); }}>
//               <input type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleInputChange} />
//               <button type="submit">Send Reset Link</button>
//               <button type="button" onClick={() => setShowForgotPassword(false)}>Back to Sign In</button>
//             </form>
//           </div>
//         </div>
//       </>
//     );
//   }

//   // Sign In UI
//   return (
//     <>
//       <Navbar isLoggedIn={localStorage.getItem('token')} setIsLoggedIn={setIsLoggedIn} />
//       <div className="auth-container">
//         <div className="auth-bg">
//           {images.map((img, idx) => (
//             <div key={idx} className={`auth-bg-image ${idx === currentImageIndex ? 'active' : ''}`} style={{ backgroundImage: `url(${img})` }} />
//           ))}
//           <div className="auth-overlay" />
//         </div>

//         <div className="auth-card">
//           <h2>Welcome Back</h2>
//           <h4>Sign in to your CarCraze account</h4>

//           <form onSubmit={handleSubmit}>
//             <div>
//               <label>Email</label>
//               <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
//               {errors.email && <span>{errors.email}</span>}
//             </div>
//             <div>
//               <label>Password</label>
//               <input type="password" name="password" value={formData.password} onChange={handleInputChange} />
//               {errors.password && <span>{errors.password}</span>}
//             </div>
//             {errors.general && <span>{errors.general}</span>}

//             <div className="form-options">
//               <label>
//                 <input type="checkbox" /> Remember me
//               </label>
//               <button type="button" onClick={() => setShowForgotPassword(true)}>Forgot Password?</button>
//             </div>

//             <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
//           </form>

//           <div className="divider">or</div>

//           <button onClick={() => handleOAuthSignIn('Google')} disabled={loading}>Continue with Google</button>
//           <button onClick={() => handleOAuthSignIn('Facebook')} disabled={loading}>Continue with Facebook</button>

//           <p>
//             Don't have an account? <span onClick={onSwitchToSignUp} style={{ cursor: 'pointer', color: 'blue' }}>Sign Up</span>
//           </p>
//         </div>
//       </div>
//     </>
//   );
// };

// export default SignIn;
