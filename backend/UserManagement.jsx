import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/api';
import './Admin.css'; // A new CSS file for admin styles

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
    return <div className="admin-loading">Loading users...</div>;
  }

  if (error) {
    return <div className="admin-error">{error}</div>;
  }

  return (
    <div className="admin-page-container">
      <h1 className="admin-page-title">User Management</h1>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.firstName} {user.lastName}</td>
                <td>{user.email}</td>
                <td><span className={`role-badge role-${user.role}`}>{user.role}</span></td>
                <td><span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>{user.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <button className="btn-sm btn-outline" onClick={() => handleViewUser(user._id)}>
                    View/Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;