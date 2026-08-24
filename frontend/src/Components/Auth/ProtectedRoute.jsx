import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '/src/index.css';

// Bug #12 fix: consume shared AuthContext instead of fetching /api/auth/profile on every navigation.
const ProtectedRoute = ({ children, requiredRole }) => {
  const navigate = useNavigate();
  const { user, authLoading } = useAuth();

  // While the initial auth check is in-flight, render nothing (avoids flash)
  if (authLoading) return null;

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    navigate('/');
    return null;
  }

  return children;
};

export default ProtectedRoute;