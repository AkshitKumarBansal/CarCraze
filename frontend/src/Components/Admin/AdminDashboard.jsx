import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_ENDPOINTS.PROFILE.replace('/auth/profile', '/admin/users')}`, {
          credentials: 'include'
        });
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        setUsers(data.users || []);
      } catch (err) {
        setError('Could not load users: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Inter, sans-serif', maxWidth: '1100px', margin: '80px auto 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>⚙️ Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          style={{ padding: '0.5rem 1.2rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        >
          Sign Out
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Users', value: users.length, color: '#6366f1' },
          { label: 'Customers', value: users.filter(u => u.role === 'customer').length, color: '#10b981' },
          { label: 'Sellers', value: users.filter(u => u.role === 'seller').length, color: '#f59e0b' },
          { label: 'Admins', value: users.filter(u => u.role === 'admin').length, color: '#ef4444' },
        ].map(stat => (
          <div key={stat.label} style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: `4px solid ${stat.color}` }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: stat.color }}>{loading ? '…' : stat.value}</div>
            <div style={{ color: '#6b7280', marginTop: '0.25rem' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <h2 style={{ marginTop: 0 }}>Registered Users</h2>
        {loading && <p>Loading users…</p>}
        {error && <p style={{ color: '#ef4444' }}>{error}</p>}
        {!loading && !error && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                  {['Name', 'Email', 'Phone', 'Role', 'Active', 'Joined'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 0.5rem', color: '#374151' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u._id} style={{ background: i % 2 === 0 ? '#f9fafb' : '#fff', borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.65rem 0.5rem' }}>{u.firstName} {u.lastName}</td>
                    <td style={{ padding: '0.65rem 0.5rem' }}>{u.email}</td>
                    <td style={{ padding: '0.65rem 0.5rem' }}>{u.phone || '—'}</td>
                    <td style={{ padding: '0.65rem 0.5rem' }}>
                      <span style={{
                        padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                        background: u.role === 'admin' ? '#fee2e2' : u.role === 'seller' ? '#fef3c7' : '#d1fae5',
                        color: u.role === 'admin' ? '#dc2626' : u.role === 'seller' ? '#d97706' : '#059669'
                      }}>{u.role}</span>
                    </td>
                    <td style={{ padding: '0.65rem 0.5rem' }}>{u.isActive ? '✅' : '❌'}</td>
                    <td style={{ padding: '0.65rem 0.5rem' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
