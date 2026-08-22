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

  const stats = [
    { label: 'Total Users', value: users.length, colorClass: 'text-indigo-500', borderClass: 'border-indigo-500' },
    { label: 'Customers', value: users.filter(u => u.role === 'customer').length, colorClass: 'text-emerald-500', borderClass: 'border-emerald-500' },
    { label: 'Sellers', value: users.filter(u => u.role === 'seller').length, colorClass: 'text-amber-500', borderClass: 'border-amber-500' },
    { label: 'Admins', value: users.filter(u => u.role === 'admin').length, colorClass: 'text-red-500', borderClass: 'border-red-500' },
  ];

  const getRoleBadge = (role) => {
    if (role === 'admin') return 'bg-red-100 text-red-600';
    if (role === 'seller') return 'bg-amber-100 text-amber-600';
    return 'bg-emerald-100 text-emerald-600';
  };

  return (
    <div className="p-8 font-sans max-w-[1100px] mx-auto mt-20 min-h-screen">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="m-0 text-3xl font-extrabold text-gray-800">⚙️ Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-5 py-2.5 bg-red-500 text-white border-none rounded-lg cursor-pointer font-semibold transition-colors shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/50"
        >
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className={`bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border-l-4 ${stat.borderClass} transition-transform hover:-translate-y-1`}>
            <div className={`text-3xl font-bold ${stat.colorClass}`}>
              {loading ? '…' : stat.value}
            </div>
            <div className="text-gray-500 mt-1 font-medium text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <h2 className="mt-0 mb-6 text-xl font-bold text-gray-800">Registered Users</h2>
        
        {loading && (
          <div className="flex items-center gap-3 text-gray-500 font-medium py-4">
            <div className="w-5 h-5 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin"></div>
            Loading users…
          </div>
        )}
        
        {error && <p className="text-red-500 font-medium bg-red-50 p-4 rounded-lg border border-red-100">{error}</p>}
        
        {!loading && !error && (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full border-collapse text-sm text-left whitespace-nowrap">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  {['Name', 'Email', 'Phone', 'Role', 'Active', 'Joined'].map(h => (
                    <th key={h} className="p-3.5 font-bold text-gray-700 tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((u) => (
                  <tr key={u._id} className="transition-colors hover:bg-indigo-50/30 even:bg-gray-50/50">
                    <td className="p-3.5 font-medium text-gray-900">{u.firstName} {u.lastName}</td>
                    <td className="p-3.5 text-gray-600">{u.email}</td>
                    <td className="p-3.5 text-gray-600">{u.phone || '—'}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getRoleBadge(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-base">{u.isActive ? '✅' : '❌'}</td>
                    <td className="p-3.5 text-gray-500 font-medium">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                    </td>
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