import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="user-profile">
      <div className="user-avatar">
        <img src={user.avatar} alt={user.name} />
      </div>
      <div className="user-info">
        <span className="user-name">{user.name}</span>
        <button onClick={handleLogout} className="logout-button">
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
