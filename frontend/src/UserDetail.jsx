import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from './config/api';
import './Admin.css';

const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_ENDPOINTS.ADMIN}/users/${userId}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user details.');
      }
      const data = await response.json();
      setUser(data.user);
      setFormData(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleBusinessInfoChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      businessInfo: {
        ...prev.businessInfo,
        [name]: value
      }
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_ENDPOINTS.ADMIN}/users/${userId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to update user.');
      await fetchUser(); // Re-fetch to show updated data
      setIsEditing(false);
    } catch (err) {
      alert('Update failed: ' + err.message);
    }
  };

  const handleStatusChange = async (isActive, isBanned) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.ADMIN}/users/${userId}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive, isBanned }),
      });
      if (!response.ok) throw new Error('Failed to update status.');
      await fetchUser();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRoleChange = async (e) => {
    try {
      const role = e.target.value;
      const response = await fetch(`${API_ENDPOINTS.ADMIN}/users/${userId}/role`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!response.ok) throw new Error('Failed to change role.');
      await fetchUser();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleVerifyStatus = async (status) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.ADMIN}/users/${userId}/verify`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update verification status.');
      await fetchUser();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleForceReset = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.ADMIN}/users/${userId}/force-reset`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to send reset email.');
      alert('Password reset email sent to user.');
    } catch (err) {
      alert(err.message);
    }
  };

  const [loginHistory, setLoginHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const fetchLoginHistory = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.ADMIN}/users/${userId}/login-history`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setLoginHistory(data.loginHistory);
        setShowHistory(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="admin-loading">Loading user profile...</div>;
  if (error) return <div className="admin-error">{error}</div>;
  if (!user) return <div className="admin-error">User not found.</div>;

  return (
    <div className="admin-page-container">
      <button className="back-btn" onClick={() => navigate('/admin/users')}>
        &larr; Back to All Users
      </button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="admin-page-title">User Profile: {user.firstName} {user.lastName}</h1>
        <div>
          <button className="btn-sm btn-outline" style={{ marginRight: '10px' }} onClick={handleForceReset}>Force Password Reset</button>
          {user.isBanned ? (
            <button className="btn-sm" style={{ backgroundColor: '#10b981', color: 'white', marginRight: '10px' }} onClick={() => handleStatusChange(user.isActive, false)}>Unban User</button>
          ) : (
            <button className="btn-sm" style={{ backgroundColor: '#ef4444', color: 'white', marginRight: '10px' }} onClick={() => handleStatusChange(user.isActive, true)}>Ban User</button>
          )}
          {user.isActive ? (
            <button className="btn-sm btn-outline" onClick={() => handleStatusChange(false, user.isBanned)}>Deactivate Account</button>
          ) : (
            <button className="btn-sm btn-outline" onClick={() => handleStatusChange(true, user.isBanned)}>Activate Account</button>
          )}
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleFormSubmit} className="admin-form">
          {/* General Info */}
          <div className="form-section">
            <h3>General Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>First Name</label>
                <input type="text" name="firstName" value={formData.firstName || ''} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" name="lastName" value={formData.lastName || ''} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={formData.email || ''} disabled />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" name="phone" value={formData.phone || ''} onChange={handleInputChange} />
              </div>
            </div>
          </div>

          {/* Seller Info */}
          {user.role === 'seller' && (
            <div className="form-section">
              <h3>Business Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Business Name</label>
                  <input type="text" name="name" value={formData.businessInfo?.name || ''} onChange={handleBusinessInfoChange} />
                </div>
                <div className="form-group">
                  <label>Business Phone</label>
                  <input type="tel" name="phone" value={formData.businessInfo?.phone || ''} onChange={handleBusinessInfoChange} />
                </div>
                <div className="form-group full-width">
                  <label>Business Address</label>
                  <input type="text" name="address" value={formData.businessInfo?.address || ''} onChange={handleBusinessInfoChange} />
                </div>
              </div>
            </div>
          )}
          
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Save Changes</button>
          </div>
        </form>
      ) : (
        <>
          <div className="admin-card">
            <div className="admin-card-header">
              <h2>User Details</h2>
              <div>
                <select 
                  value={user.role} 
                  onChange={handleRoleChange} 
                  style={{ marginRight: '15px', padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="customer">Role: Customer</option>
                  <option value="seller">Role: Seller</option>
                  <option value="admin">Role: Admin</option>
                </select>
                <button className="btn-sm btn-outline" onClick={() => setIsEditing(true)}>Edit Profile</button>
              </div>
            </div>
            <div className="admin-detail-grid">
              <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
              <p><strong>Role:</strong> <span className={`role-badge role-${user.role}`}>{user.role}</span></p>
              <p>
                <strong>Status:</strong>{' '}
                {user.isBanned ? (
                  <span className="status-badge inactive" style={{backgroundColor: '#fee2e2', color: '#991b1b'}}>Banned</span>
                ) : (
                  <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                )}
              </p>
              <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleString()}</p>
            </div>
          </div>

          {user.role === 'seller' && user.sellerData && (
            <div className="admin-card">
              <h2>Seller Information</h2>
              
              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                <h3>Verification Status: <span style={{ textTransform: 'capitalize', color: user.verification?.status === 'approved' ? '#10b981' : '#f59e0b' }}>{user.verification?.status || 'unverified'}</span></h3>
                <div style={{ marginTop: '10px' }}>
                  <button className="btn-sm btn-outline" style={{ marginRight: '10px' }} onClick={() => handleVerifyStatus('pending')}>Mark Pending</button>
                  <button className="btn-sm" style={{ backgroundColor: '#10b981', color: 'white', marginRight: '10px' }} onClick={() => handleVerifyStatus('approved')}>Approve</button>
                  <button className="btn-sm" style={{ backgroundColor: '#ef4444', color: 'white' }} onClick={() => handleVerifyStatus('rejected')}>Reject</button>
                </div>
              </div>

              <div className="admin-detail-grid">
                <p><strong>Business Name:</strong> {user.businessInfo?.name || 'N/A'}</p>
                <p><strong>Business Phone:</strong> {user.businessInfo?.phone || 'N/A'}</p>
                <p><strong>Business Address:</strong> {user.businessInfo?.address || 'N/A'}</p>
              </div>
              <h3>Inventory ({user.sellerData.inventory.length})</h3>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead><tr><th>Car</th><th>Price</th><th>Status</th></tr></thead>
                  <tbody>
                    {user.sellerData.inventory.map(car => (
                      <tr key={car._id}>
                        <td>{car.year} {car.brand} {car.model}</td>
                        <td>₹{car.price.toLocaleString()}</td>
                        <td><span className={`status-badge ${car.status}`}>{car.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {user.role === 'customer' && user.customerData && (
            <div className="admin-card">
              <h2>Customer Activity</h2>
              <h3>Order History ({user.customerData.orderHistory.length})</h3>
              {user.customerData.orderHistory.length > 0 ? (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead><tr><th>Order ID</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
                    <tbody>
                      {user.customerData.orderHistory.map(order => (
                        <tr key={order._id}>
                          <td>...{order._id.slice(-6)}</td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td>₹{order.total.toLocaleString()}</td>
                          <td><span className={`status-badge ${order.status}`}>{order.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p>No orders found.</p>}
              
              <h3>Rental History ({user.customerData.rentalHistory.length})</h3>
              {user.customerData.rentalHistory.length > 0 ? (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead><tr><th>Car</th><th>Start Date</th><th>End Date</th><th>Total</th></tr></thead>
                    <tbody>
                      {user.customerData.rentalHistory.map(rental => (
                        <tr key={rental._id}>
                          <td>{rental.carId?.brand} {rental.carId?.model}</td>
                          <td>{new Date(rental.startDate).toLocaleDateString()}</td>
                          <td>{new Date(rental.endDate).toLocaleDateString()}</td>
                          <td>₹{rental.totalPrice.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p>No rentals found.</p>}
            </div>
          )}

          {/* Login History */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2>Security & Login History</h2>
              {!showHistory && <button className="btn-sm btn-outline" onClick={fetchLoginHistory}>Load Login History</button>}
            </div>
            {showHistory && (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead><tr><th>Date & Time</th><th>IP Address</th><th>Status</th></tr></thead>
                  <tbody>
                    {loginHistory.length > 0 ? (
                      loginHistory.map((log, index) => (
                        <tr key={index}>
                          <td>{new Date(log.timestamp).toLocaleString()}</td>
                          <td>{log.ip || 'Unknown'}</td>
                          <td>{log.success ? 'Success' : 'Failed'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>No recent logins recorded.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default UserDetail;