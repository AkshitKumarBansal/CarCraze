import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/api';

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

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen pt-[100px] text-gray-600 text-lg font-medium">
      <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mr-3"></div>
      Loading user profile...
    </div>
  );
  if (error) return (
    <div className="flex items-center justify-center min-h-screen pt-[100px]">
      <div className="bg-red-50 text-red-600 border border-red-200 p-6 rounded-xl font-medium text-lg text-center max-w-lg shadow-sm">
        <i className="fas fa-exclamation-triangle block text-3xl mb-3"></i>
        {error}
      </div>
    </div>
  );
  if (!user) return <div className="text-center py-20 text-xl font-bold text-gray-500">User not found.</div>;

  return (
    <div className="max-w-[1200px] mx-auto mt-[calc(80px+2rem)] mb-8 p-4 md:p-8 font-sans">
      
      <button 
        className="inline-flex items-center gap-2 mb-6 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-semibold cursor-pointer transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200" 
        onClick={() => navigate('/admin/users')}
      >
        &larr; Back to All Users
      </button>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 m-0">User Profile: {user.firstName} {user.lastName}</h1>
        <div className="flex flex-wrap gap-3">
          <button 
            className="px-4 py-2 text-sm font-bold border-2 border-indigo-500 text-indigo-600 bg-transparent rounded-lg cursor-pointer transition-colors hover:bg-indigo-50" 
            onClick={handleForceReset}
          >
            Force Password Reset
          </button>
          
          {user.isBanned ? (
            <button 
              className="px-4 py-2 text-sm font-bold border-2 border-emerald-500 bg-emerald-500 text-white rounded-lg cursor-pointer transition-colors hover:bg-emerald-600 hover:border-emerald-600 shadow-sm" 
              onClick={() => handleStatusChange(user.isActive, false)}
            >
              Unban User
            </button>
          ) : (
            <button 
              className="px-4 py-2 text-sm font-bold border-2 border-red-500 bg-red-500 text-white rounded-lg cursor-pointer transition-colors hover:bg-red-600 hover:border-red-600 shadow-sm" 
              onClick={() => handleStatusChange(user.isActive, true)}
            >
              Ban User
            </button>
          )}
          
          {user.isActive ? (
            <button 
              className="px-4 py-2 text-sm font-bold border-2 border-gray-400 text-gray-700 bg-transparent rounded-lg cursor-pointer transition-colors hover:bg-gray-100" 
              onClick={() => handleStatusChange(false, user.isBanned)}
            >
              Deactivate Account
            </button>
          ) : (
            <button 
              className="px-4 py-2 text-sm font-bold border-2 border-emerald-500 text-emerald-600 bg-transparent rounded-lg cursor-pointer transition-colors hover:bg-emerald-50" 
              onClick={() => handleStatusChange(true, user.isBanned)}
            >
              Activate Account
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleFormSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          
          {/* General Info */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-2">General Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-gray-700 text-sm">First Name</label>
                <input 
                  type="text" 
                  name="firstName" 
                  value={formData.firstName || ''} 
                  onChange={handleInputChange} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-gray-700 text-sm">Last Name</label>
                <input 
                  type="text" 
                  name="lastName" 
                  value={formData.lastName || ''} 
                  onChange={handleInputChange} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-gray-700 text-sm">Email</label>
                <input 
                  type="email" 
                  value={formData.email || ''} 
                  disabled 
                  className="w-full p-3 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-gray-700 text-sm">Phone</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone || ''} 
                  onChange={handleInputChange} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Seller Info */}
          {user.role === 'seller' && (
            <div className="mb-8 mt-10">
              <h3 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-2">Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-gray-700 text-sm">Business Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.businessInfo?.name || ''} 
                    onChange={handleBusinessInfoChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-gray-700 text-sm">Business Phone</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.businessInfo?.phone || ''} 
                    onChange={handleBusinessInfoChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="font-semibold text-gray-700 text-sm">Business Address</label>
                  <input 
                    type="text" 
                    name="address" 
                    value={formData.businessInfo?.address || ''} 
                    onChange={handleBusinessInfoChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="flex gap-4 justify-end mt-10 border-t border-gray-100 pt-6">
            <button 
              type="button" 
              className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold border-none rounded-lg cursor-pointer hover:bg-gray-200 transition-colors" 
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 bg-indigo-600 text-white font-bold border-none rounded-lg cursor-pointer hover:bg-indigo-700 hover:shadow-md transition-all"
            >
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 mb-8 transition-shadow hover:shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-5 mb-6 gap-4">
              <h2 className="m-0 text-xl font-extrabold text-gray-900">User Details</h2>
              <div className="flex items-center gap-3">
                <select 
                  value={user.role} 
                  onChange={handleRoleChange} 
                  className="px-3 py-2 bg-gray-50 border border-gray-300 text-gray-700 font-semibold rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors"
                >
                  <option value="customer">Role: Customer</option>
                  <option value="seller">Role: Seller</option>
                  <option value="admin">Role: Admin</option>
                </select>
                <button 
                  className="px-4 py-2 text-sm font-bold border-2 border-indigo-500 text-indigo-600 bg-transparent rounded-lg cursor-pointer transition-colors hover:bg-indigo-50" 
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="m-0 text-gray-800"><strong className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Name</strong> <span className="font-semibold text-lg">{user.firstName} {user.lastName}</span></p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="m-0 text-gray-800"><strong className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Email</strong> <span className="font-medium truncate block">{user.email}</span></p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="m-0 text-gray-800"><strong className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Phone</strong> <span className="font-medium">{user.phone || 'N/A'}</span></p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col justify-center">
                <strong className="text-gray-500 block text-xs uppercase tracking-wider mb-1.5">Role</strong>
                <div>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      user.role === 'admin' ? 'bg-red-100 text-red-600' : 
                      user.role === 'seller' ? 'bg-amber-100 text-amber-600' : 
                      'bg-emerald-100 text-emerald-600'
                    }`}>
                    {user.role}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col justify-center">
                <strong className="text-gray-500 block text-xs uppercase tracking-wider mb-1.5">Status</strong> 
                <div>
                  {user.isBanned ? (
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">Banned</span>
                  ) : (
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      user.isActive ? 'bg-emerald-100 text-emerald-600 border-emerald-200' : 'bg-gray-200 text-gray-600 border-gray-300'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="m-0 text-gray-800"><strong className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Joined</strong> <span className="font-medium">{new Date(user.createdAt).toLocaleString()}</span></p>
              </div>
            </div>
          </div>

          {user.role === 'seller' && user.sellerData && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 mb-8 transition-shadow hover:shadow-md">
              <h2 className="m-0 text-xl font-extrabold text-gray-900 border-b border-gray-200 pb-4 mb-6">Seller Information</h2>
              
              <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="m-0 text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Verification Status</h3>
                  <span className={`text-xl font-extrabold capitalize ${user.verification?.status === 'approved' ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {user.verification?.status || 'unverified'}
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap mt-2 sm:mt-0">
                  <button className="px-4 py-2 text-xs font-bold border-2 border-indigo-500 text-indigo-600 bg-transparent rounded-lg cursor-pointer transition-colors hover:bg-indigo-50" onClick={() => handleVerifyStatus('pending')}>Mark Pending</button>
                  <button className="px-4 py-2 text-xs font-bold border-2 border-emerald-500 bg-emerald-500 text-white rounded-lg cursor-pointer transition-colors hover:bg-emerald-600 shadow-sm" onClick={() => handleVerifyStatus('approved')}>Approve</button>
                  <button className="px-4 py-2 text-xs font-bold border-2 border-red-500 bg-red-500 text-white rounded-lg cursor-pointer transition-colors hover:bg-red-600 shadow-sm" onClick={() => handleVerifyStatus('rejected')}>Reject</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <p className="m-0 text-gray-800"><strong className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Business Name</strong> <span className="font-semibold">{user.businessInfo?.name || 'N/A'}</span></p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <p className="m-0 text-gray-800"><strong className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Business Phone</strong> <span className="font-semibold">{user.businessInfo?.phone || 'N/A'}</span></p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <p className="m-0 text-gray-800"><strong className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Business Address</strong> <span className="font-semibold">{user.businessInfo?.address || 'N/A'}</span></p>
                </div>
              </div>
              
              <h3 className="m-0 mt-8 text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4">Inventory <span className="text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full text-sm ml-2">{user.sellerData.inventory.length}</span></h3>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full border-collapse text-sm text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="p-4 font-bold text-gray-600 tracking-wide">Car</th>
                      <th className="p-4 font-bold text-gray-600 tracking-wide">Price</th>
                      <th className="p-4 font-bold text-gray-600 tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {user.sellerData.inventory.map(car => (
                      <tr key={car._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 font-semibold text-gray-900">{car.year} {car.brand} {car.model}</td>
                        <td className="p-4 text-gray-700 font-medium">₹{car.price.toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-wider ${
                            car.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 
                            car.status === 'sold' ? 'bg-red-100 text-red-700' : 
                            'bg-gray-200 text-gray-700'
                          }`}>
                            {car.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {user.role === 'customer' && user.customerData && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 mb-8 transition-shadow hover:shadow-md">
              <h2 className="m-0 text-xl font-extrabold text-gray-900 border-b border-gray-200 pb-4 mb-8">Customer Activity</h2>
              
              <div className="mb-10">
                <h3 className="m-0 text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
                  Order History 
                  <span className="text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full text-sm">{user.customerData.orderHistory.length}</span>
                </h3>
                {user.customerData.orderHistory.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                    <table className="w-full border-collapse text-sm text-left">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="p-4 font-bold text-gray-600 tracking-wide">Order ID</th>
                          <th className="p-4 font-bold text-gray-600 tracking-wide">Date</th>
                          <th className="p-4 font-bold text-gray-600 tracking-wide">Total</th>
                          <th className="p-4 font-bold text-gray-600 tracking-wide">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {user.customerData.orderHistory.map(order => (
                          <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-4 text-gray-500 font-mono text-xs bg-gray-50">...{order._id.slice(-6)}</td>
                            <td className="p-4 text-gray-700 font-medium">{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td className="p-4 font-bold text-gray-900">₹{order.total.toLocaleString()}</td>
                            <td className="p-4">
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-wider ${
                                order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                                order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 
                                'bg-amber-100 text-amber-700'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <div className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-300 text-center text-gray-500 font-medium">No orders found.</div>}
              </div>
              
              <div>
                <h3 className="m-0 text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
                  Rental History 
                  <span className="text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full text-sm">{user.customerData.rentalHistory.length}</span>
                </h3>
                {user.customerData.rentalHistory.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                    <table className="w-full border-collapse text-sm text-left">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="p-4 font-bold text-gray-600 tracking-wide">Car</th>
                          <th className="p-4 font-bold text-gray-600 tracking-wide">Start Date</th>
                          <th className="p-4 font-bold text-gray-600 tracking-wide">End Date</th>
                          <th className="p-4 font-bold text-gray-600 tracking-wide">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {user.customerData.rentalHistory.map(rental => (
                          <tr key={rental._id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-4 font-semibold text-gray-900">{rental.carId?.brand} {rental.carId?.model}</td>
                            <td className="p-4 text-gray-700 font-medium">{new Date(rental.startDate).toLocaleDateString()}</td>
                            <td className="p-4 text-gray-700 font-medium">{new Date(rental.endDate).toLocaleDateString()}</td>
                            <td className="p-4 font-bold text-gray-900">₹{rental.totalPrice.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <div className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-300 text-center text-gray-500 font-medium">No rentals found.</div>}
              </div>
            </div>
          )}

          {/* Login History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 transition-shadow hover:shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-4 mb-6 gap-4">
              <h2 className="m-0 text-xl font-extrabold text-gray-900">Security & Login History</h2>
              {!showHistory && (
                <button 
                  className="px-4 py-2 text-sm font-bold border-2 border-indigo-500 text-indigo-600 bg-transparent rounded-lg cursor-pointer transition-colors hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 shadow-sm" 
                  onClick={fetchLoginHistory}
                >
                  <i className="fas fa-history mr-2"></i> Load Login History
                </button>
              )}
            </div>
            
            {showHistory && (
              <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm animate-[fadeIn_0.4s_ease-out]">
                <table className="w-full border-collapse text-sm text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="p-4 font-bold text-gray-600 tracking-wide">Date & Time</th>
                      <th className="p-4 font-bold text-gray-600 tracking-wide">IP Address</th>
                      <th className="p-4 font-bold text-gray-600 tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loginHistory.length > 0 ? (
                      loginHistory.map((log, index) => (
                        <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4 text-gray-700 font-medium">{new Date(log.timestamp).toLocaleString()}</td>
                          <td className="p-4 font-mono text-xs text-gray-500 bg-gray-50 rounded mx-4 my-2 inline-block px-2">{log.ip || 'Unknown'}</td>
                          <td className="p-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-wider ${
                              log.success ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {log.success ? 'Success' : 'Failed'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center py-8 text-gray-500 font-medium bg-gray-50">No recent logins recorded.</td>
                      </tr>
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