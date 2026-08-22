import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/api';
import { useToast } from '../../Hooks/useToast';
import Navbar from '../../Components/Layout/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faArrowLeft, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf1] px-4 pt-24 pb-8">
        <div className="bg-white rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.10)] p-8 sm:p-12 w-full max-w-[460px] text-center transform transition-all duration-500 ease-out translate-y-0 opacity-100">
          {!sent ? (
            <>
              <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center mx-auto mb-6 shadow-[0_8px_24px_rgba(102,126,234,0.35)]">
                <FontAwesomeIcon icon={faEnvelope} className="text-[1.8rem] text-white" />
              </div>
              <h1 className="text-[1.75rem] font-extrabold text-gray-800 mb-2">Forgot Password?</h1>
              <p className="text-gray-500 text-[0.95rem] mb-8 leading-relaxed">
                No worries! Enter your email and we'll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left mb-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="fp-email" className="text-[0.875rem] font-semibold text-gray-700">Email Address</label>
                  <div className="relative">
                    <FontAwesomeIcon icon={faEnvelope} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[0.9rem]" />
                    <input
                      id="fp-email"
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      placeholder="Enter your registered email"
                      autoFocus
                      className={`w-full py-3 pr-3.5 pl-10 border-2 rounded-xl text-[0.95rem] transition-all duration-200 bg-gray-50 focus:outline-none focus:bg-white focus:ring-[3px] ${
                        error 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15' 
                          : 'border-gray-200 focus:border-[#667eea] focus:ring-[#667eea]/15'
                      }`}
                    />
                  </div>
                  {error && <span className="text-red-500 text-[0.82rem] font-medium">{error}</span>}
                </div>

                <button
                  type="submit"
                  className="w-full py-[13px] border-none rounded-xl text-base font-bold cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white shadow-[0_4px_15px_rgba(102,126,234,0.35)] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(102,126,234,0.45)] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_15px_rgba(102,126,234,0.35)]"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="w-5 h-5 border-[3px] border-white/40 border-t-white rounded-full inline-block animate-spin" />
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPaperPlane} />
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>

              <button 
                className="w-full py-[13px] rounded-xl text-base font-bold cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 bg-transparent text-[#667eea] border-2 border-gray-200 mt-2 hover:border-[#667eea] hover:bg-[#f0f4ff]" 
                onClick={() => navigate('/signin')}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                Back to Sign In
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="text-[4rem] animate-[bounce_0.5s_ease-out]">📬</div>
              <h2 className="text-2xl font-extrabold text-gray-800">Check your inbox!</h2>
              <p className="text-gray-500 leading-relaxed mb-2">
                If <strong className="text-gray-700">{email}</strong> is registered with CarCraze, you'll
                receive a password reset link shortly.
              </p>
              <p className="text-[0.85rem] text-gray-400">
                Check your spam folder if you don't see it within a minute.
              </p>
              <button 
                className="w-full py-[13px] border-none rounded-xl text-base font-bold cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white shadow-[0_4px_15px_rgba(102,126,234,0.35)] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(102,126,234,0.45)] mt-4" 
                onClick={() => navigate('/signin')}
              >
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