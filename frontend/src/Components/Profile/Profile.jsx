import React, { useState, useEffect } from 'react';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Retrieve user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) {
    return <div className="profile-container">Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1 className="profile-header">My Profile</h1>
        <div className="profile-details">
          <div className="profile-detail-item">
            <span className="detail-label">First Name:</span>
            <span className="detail-value">{user.firstName}</span>
          </div>
          <div className="profile-detail-item">
            <span className="detail-label">Last Name:</span>
            <span className="detail-value">{user.lastName}</span>
          </div>
          <div className="profile-detail-item">
            <span className="detail-label">Email:</span>
            <span className="detail-value">{user.email}</span>
          </div>
          <div className="profile-detail-item">
            <span className="detail-label">Mobile Number:</span>
            <span className="detail-value">{user.mobileNumber || 'Not Provided'}</span>
          </div>
        </div>
        <button className="edit-profile-button">Edit Profile</button>
      </div>
    </div>
  );
};

export default Profile;
