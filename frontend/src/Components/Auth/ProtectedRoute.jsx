import React from 'react';
import { useNavigate } from 'react-router-dom';
import '/src/index.css';

const ProtectedRoute = ({ children, requiredRole }) => {
  const navigate = useNavigate();

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/signin');
      return;
    }
    
    if (requiredRole) {
      const user = JSON.parse(userData);
      if (user.role !== requiredRole) {
        navigate('/');
        return;
      }
    }
  }, [navigate, requiredRole]);
  
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  
  if (!token || !userData) {
    return null;
  }
  
  if (requiredRole) {
    const user = JSON.parse(userData);
    if (user.role !== requiredRole) {
      return null;
    }
  }
  
  return children;
};

export default ProtectedRoute;