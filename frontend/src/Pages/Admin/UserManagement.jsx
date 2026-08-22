import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_ENDPOINTS.ADMIN}/users`, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch users. You may not have permission.');
        }
        const data = await response.json();
        setUsers(data.users || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleViewUser = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-[100px] text-gray-600 text-lg font-medium">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mr-3"></div>
        Loading users...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-[100px]">
        <div className="bg-red-50 text-red-600 border border-red-200 p-6 rounded-xl font-medium text-lg text-center max-w-lg shadow-sm">
          <i className="fas fa-exclamation-triangle block text-3xl mb-3"></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto mt-[calc(80px+2rem)] mb-8 p-4 md:p-8 font-sans min-h-screen">
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">User Management</h1>
      
      <div className="bg-white rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[0.9rem] text-left whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Verification</th>
                <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user, index) => (
                <tr key={user._id} className={`transition-colors hover:bg-indigo-50/40 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                  <td className="px-5 py-3.5 font-semibold text-gray-900">{user.firstName} {user.lastName}</td>
                  <td className="px-5 py-3.5 text-gray-600 font-medium">{user.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      user.role === 'admin' ? 'bg-red-100 text-red-600' : 
                      user.role === 'seller' ? 'bg-amber-100 text-amber-600' : 
                      'bg-emerald-100 text-emerald-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {user.isBanned ? (
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-700">Banned</span>
                    ) : (
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        user.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    {user.role === 'seller' ? (
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        user.verification?.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 
                        user.verification?.status === 'pending' ? 'bg-amber-100 text-amber-600' : 
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {user.verification?.status || 'unverified'}
                      </span>
                    ) : (
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-500">N/A</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 font-medium">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5 text-center">
                    <button 
                      className="px-4 py-1.5 text-xs font-bold border-2 border-indigo-500 text-indigo-600 bg-transparent rounded-lg cursor-pointer transition-colors hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" 
                      onClick={() => handleViewUser(user._id)}
                    >
                      View / Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;