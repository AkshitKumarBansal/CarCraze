import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/api';
import { useToast } from '../../Hooks/useToast';
import Navbar from '../Common/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faArrowLeft, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.FORGOT_PASSWORD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      // Always treat as success (backend uses same message for security)
      setSent(true);
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="fp-page">
        <div className="fp-card">
          {!sent ? (
            <>
              <div className="fp-icon-wrap">
                <FontAwesomeIcon icon={faEnvelope} className="fp-icon" />
              </div>
              <h1 className="fp-title">Forgot Password?</h1>
              <p className="fp-subtitle">
                No worries! Enter your email and we'll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="fp-form">
                <div className="fp-field">
                  <label htmlFor="fp-email">Email Address</label>
                  <div className="fp-input-wrap">
                    <FontAwesomeIcon icon={faEnvelope} className="fp-input-icon" />
                    <input
                      id="fp-email"
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      placeholder="Enter your registered email"
                      autoFocus
                      className={error ? 'fp-input error' : 'fp-input'}
                    />
                  </div>
                  {error && <span className="fp-error">{error}</span>}
                </div>

                <button
                  type="submit"
                  className="fp-btn primary"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="fp-spinner" />
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPaperPlane} />
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>

              <button className="fp-btn ghost" onClick={() => navigate('/signin')}>
                <FontAwesomeIcon icon={faArrowLeft} />
                Back to Sign In
              </button>
            </>
          ) : (
            <div className="fp-success">
              <div className="fp-success-icon">📬</div>
              <h2>Check your inbox!</h2>
              <p>
                If <strong>{email}</strong> is registered with CarCraze, you'll
                receive a password reset link shortly.
              </p>
              <p className="fp-hint">
                Check your spam folder if you don't see it within a minute.
              </p>
              <button className="fp-btn primary" onClick={() => navigate('/signin')}>
                <FontAwesomeIcon icon={faArrowLeft} />
                Back to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
