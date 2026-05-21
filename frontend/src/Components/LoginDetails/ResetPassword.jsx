import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/api';
import { useToast } from '../../Hooks/useToast';
import Navbar from '../Common/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import './ForgotPassword.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  if (!token) {
    return (
      <>
        <Navbar />
        <div className="fp-page">
          <div className="fp-card fp-error-card">
            <FontAwesomeIcon icon={faTimesCircle} className="fp-error-icon" />
            <h2>Invalid Link</h2>
            <p>This password reset link is missing or invalid. Please request a new one.</p>
            <button className="fp-btn primary" onClick={() => navigate('/forgot-password')}>
              Request New Link
            </button>
          </div>
        </div>
      </>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.RESET_PASSWORD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Something went wrong. Please try again.');
        return;
      }
      setDone(true);
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
          {!done ? (
            <>
              <div className="fp-icon-wrap">
                <FontAwesomeIcon icon={faLock} className="fp-icon" />
              </div>
              <h1 className="fp-title">Set New Password</h1>
              <p className="fp-subtitle">Choose a strong new password for your account.</p>

              <form onSubmit={handleSubmit} className="fp-form">
                <div className="fp-field">
                  <label htmlFor="rp-password">New Password</label>
                  <div className="fp-input-wrap">
                    <FontAwesomeIcon icon={faLock} className="fp-input-icon" />
                    <input
                      id="rp-password"
                      type="password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      placeholder="Minimum 6 characters"
                      className={error ? 'fp-input error' : 'fp-input'}
                      autoFocus
                    />
                  </div>
                </div>

                <div className="fp-field">
                  <label htmlFor="rp-confirm">Confirm Password</label>
                  <div className="fp-input-wrap">
                    <FontAwesomeIcon icon={faLock} className="fp-input-icon" />
                    <input
                      id="rp-confirm"
                      type="password"
                      value={confirm}
                      onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                      placeholder="Re-enter your new password"
                      className={error ? 'fp-input error' : 'fp-input'}
                    />
                  </div>
                  {error && <span className="fp-error">{error}</span>}
                </div>

                <button type="submit" className="fp-btn primary" disabled={loading}>
                  {loading ? <span className="fp-spinner" /> : 'Reset Password'}
                </button>
              </form>
            </>
          ) : (
            <div className="fp-success">
              <FontAwesomeIcon icon={faCheckCircle} className="fp-check-icon" />
              <h2>Password Reset!</h2>
              <p>Your password has been updated successfully. You can now sign in with your new password.</p>
              <button className="fp-btn primary" onClick={() => navigate('/signin')}>
                Go to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
