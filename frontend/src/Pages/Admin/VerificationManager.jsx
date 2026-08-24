import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

const VerificationManager = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [activeRejectId, setActiveRejectId] = useState(null);

  // Helper to get the auth token (adjust if you store it in a cookie instead)
  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
    withCredentials: true
  });

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/verifications/pending`, 
        getAuthHeaders()
      );
      setPendingUsers(response.data.data);
    } catch (err) {
      console.error('Fetch Error:', err);
      setError(err.response?.data?.message || 'Failed to load verifications.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (userId, status) => {
    try {
      const payload = { status };
      if (status === 'rejected') {
        if (!rejectReason.trim()) return alert('Please provide a rejection reason.');
        payload.rejectionReason = rejectReason;
      }

      await axios.put(
        `${API_BASE_URL}/api/admin/verifications/${userId}`, 
        payload,
        getAuthHeaders()
      );
      
      alert(`User ${status} successfully!`);
      setPendingUsers(pendingUsers.filter(user => user._id !== userId));
      setActiveRejectId(null);
      setRejectReason('');
    } catch (err) {
      console.error('Update Error:', err);
      alert(err.response?.data?.message || `Failed to ${status} user.`);
    }
  };

  if (loading) return <div className="p-6">Loading pending verifications...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Pending ID Verifications</h2>
      
      {pendingUsers.length === 0 ? (
        <p className="text-gray-500">No pending verifications to review.</p>
      ) : (
        <div className="space-y-6">
          {pendingUsers.map((user) => (
            <div key={user._id} className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg">{user.firstName} {user.lastName}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-xs text-gray-400 mt-1">Submitted: {new Date(user.verification.submittedAt).toLocaleDateString()}</p>
                
                <div className="flex gap-4 mt-3">
                  <a 
                    href={user.verification.idDocumentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm font-medium"
                  >
                    View ID Document
                  </a>
                  <a 
                    href={user.verification.drivingLicenseUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm font-medium"
                  >
                    View Driving License
                  </a>
                </div>
              </div>

              <div className="flex flex-col gap-2 min-w-[200px]">
                {activeRejectId === user._id ? (
                  <div className="flex flex-col gap-2">
                    <input 
                      type="text" 
                      placeholder="Reason for rejection..."
                      className="border rounded p-2 text-sm"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleAction(user._id, 'rejected')}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm flex-1 hover:bg-red-700"
                      >
                        Confirm
                      </button>
                      <button 
                        onClick={() => {
                          setActiveRejectId(null);
                          setRejectReason('');
                        }}
                        className="bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm flex-1 hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={() => handleAction(user._id, 'approved')}
                      className="bg-green-600 text-white px-4 py-2 rounded font-medium hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => setActiveRejectId(user._id)}
                      className="bg-red-100 text-red-700 px-4 py-2 rounded font-medium hover:bg-red-200 transition-colors"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VerificationManager;