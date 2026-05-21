import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/api';
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
      if (!response.ok) {
        throw new Error('Failed to update user.');
      }
      await fetchUser(); // Re-fetch to show updated data
      setIsEditing(false);
    } catch (err) {
      setError('Update failed: ' + err.message);
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
      <h1 className="admin-page-title">User Profile: {user.firstName} {user.lastName}</h1>

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
              <div className="form-group">
                <label>Role</label>
                <select name="role" value={formData.role} onChange={handleInputChange}>
                  <option value="customer">Customer</option>
                  <option value="seller">Seller</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="isActive" value={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.value === 'true'})}>
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
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
              <button className="btn-sm btn-outline" onClick={() => setIsEditing(true)}>Edit</button>
            </div>
            <div className="admin-detail-grid">
              <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
              <p><strong>Role:</strong> <span className={`role-badge role-${user.role}`}>{user.role}</span></p>
              <p><strong>Status:</strong> <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>{user.isActive ? 'Active' : 'Inactive'}</span></p>
              <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleString()}</p>
            </div>
          </div>

          {user.role === 'seller' && user.sellerData && (
            <div className="admin-card">
              <h2>Seller Information</h2>
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
        </>
      )}
    </div>
  );
};

export default UserDetail;