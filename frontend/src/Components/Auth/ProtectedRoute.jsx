import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/api';
import '/src/index.css';

const ProtectedRoute = ({ children, requiredRole }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.PROFILE, {
          credentials: 'include'
        });

        if (response.ok) {
          const userData = await response.json();
          setIsAuthenticated(true);
          setUserRole(userData.role);

          // Store user data for quick access
          localStorage.setItem('user', JSON.stringify(userData));

          // Check role if required
          if (requiredRole && userData.role !== requiredRole) {
            navigate('/');
          }
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem('user');
          navigate('/signin');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        navigate('/signin');
      }
    };

    checkAuth();
  }, [navigate, requiredRole]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return null;
  }

  // If not authenticated, don't render children (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // If role doesn't match, don't render children (will redirect)
  if (requiredRole && userRole !== requiredRole) {
    return null;
  }

  return children;
};

export default ProtectedRoute;