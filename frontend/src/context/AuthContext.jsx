import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS } from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);          // full user object or null
  const [authLoading, setAuthLoading] = useState(true); // true while initial check runs

  /**
   * Fetch the current session from the backend. Called once on mount
   * and again after login/logout so all consumers stay in sync.
   */
  const refreshAuth = useCallback(async () => {
    try {
      const res = await fetch(API_ENDPOINTS.PROFILE, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
    } catch {
      setUser(null);
      localStorage.removeItem('user');
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const logout = useCallback(async () => {
    try {
      await fetch(API_ENDPOINTS.LOGOUT, { method: 'POST', credentials: 'include' });
    } catch { /* ignore network errors on logout */ }
    setUser(null);
    localStorage.removeItem('user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, authLoading, refreshAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export default AuthContext;
