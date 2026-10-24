import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

const VerificationManager = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [activeRejectId, setActiveRejectId] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    },
    withCredentials: true,
  });

  const fetchPendingVerifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${API_BASE_URL}/api/admin/verifications/pending`,
        getAuthHeaders()
      );

      setPendingUsers(
        Array.isArray(response.data?.data) ? response.data.data : []
      );
    } catch (err) {
      console.error('Fetch verification error:', err);

      setError(
        err.response?.data?.message ||
          'Failed to load pending identity verifications.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingVerifications();
  }, [fetchPendingVerifications]);

  const handleAction = async (userId, status) => {
    if (processingId) return;

    const payload = { status };

    if (status === 'rejected') {
      const reason = rejectReason.trim();

      if (!reason) {
        alert('Please provide a rejection reason.');
        return;
      }

      if (reason.length > 500) {
        alert('Rejection reason cannot exceed 500 characters.');
        return;
      }

      payload.rejectionReason = reason;
    }

    try {
      setProcessingId(userId);

      await axios.put(
        `${API_BASE_URL}/api/admin/verifications/${userId}`,
        payload,
        getAuthHeaders()
      );

      alert(
        status === 'approved'
          ? 'Identity verification approved successfully.'
          : 'Identity verification rejected successfully.'
      );

      setPendingUsers((currentUsers) =>
        currentUsers.filter((user) => user._id !== userId)
      );

      setActiveRejectId(null);
      setRejectReason('');
    } catch (err) {
      console.error('Update verification error:', err);

      alert(
        err.response?.data?.message ||
          `Failed to ${status} identity verification.`
      );
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6" role="status">
        Loading pending verifications...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500" role="alert">
          {error}
        </p>

        <button
          type="button"
          onClick={fetchPendingVerifications}
          className="mt-3 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">
          Pending ID Verifications
        </h2>

        <button
          type="button"
          onClick={fetchPendingVerifications}
          className="rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100"
        >
          Refresh
        </button>
      </div>

      {pendingUsers.length === 0 ? (
        <p className="text-gray-500">
          No pending identity verifications to review.
        </p>
      ) : (
        <div className="space-y-6">
          {pendingUsers.map((user) => {
            const identity = user.identityVerification || {};

            const submittedDate = identity.submittedAt
              ? new Date(identity.submittedAt)
              : null;

            const validSubmittedDate =
              submittedDate &&
              !Number.isNaN(submittedDate.getTime());

            return (
              <div
                key={user._id}
                className="flex flex-col justify-between gap-4 rounded-lg border border-gray-200 p-4 md:flex-row"
              >
                <div className="min-w-0">
                  <h3 className="text-lg font-bold">
                    {user.firstName} {user.lastName}
                  </h3>

                  <p className="text-sm text-gray-600">
                    {user.email}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Submitted:{' '}
                    {validSubmittedDate
                      ? submittedDate.toLocaleDateString()
                      : 'Not available'}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-4">
                    {identity.idDocumentUrl ? (
                      <a
                        href={identity.idDocumentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        View ID Document
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">
                        ID document unavailable
                      </span>
                    )}

                    {identity.drivingLicenseUrl ? (
                      <a
                        href={identity.drivingLicenseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        View Driving License
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">
                        Driving licence unavailable
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex min-w-[200px] flex-col gap-2">
                  {activeRejectId === user._id ? (
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor={`rejection-reason-${user._id}`}
                        className="text-sm font-medium"
                      >
                        Rejection reason
                      </label>

                      <textarea
                        id={`rejection-reason-${user._id}`}
                        placeholder="Explain why the documents are rejected..."
                        className="w-full rounded border p-2 text-sm"
                        value={rejectReason}
                        maxLength={500}
                        rows={3}
                        onChange={(event) =>
                          setRejectReason(event.target.value)
                        }
                        disabled={processingId === user._id}
                      />

                      <p className="text-xs text-gray-500">
                        {rejectReason.length}/500 characters
                      </p>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleAction(user._id, 'rejected')
                          }
                          disabled={processingId === user._id}
                          className="flex-1 rounded bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {processingId === user._id
                            ? 'Processing...'
                            : 'Confirm Rejection'}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveRejectId(null);
                            setRejectReason('');
                          }}
                          disabled={processingId === user._id}
                          className="flex-1 rounded bg-gray-300 px-3 py-2 text-sm text-gray-800 hover:bg-gray-400 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          handleAction(user._id, 'approved')
                        }
                        disabled={processingId === user._id}
                        className="rounded bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {processingId === user._id
                          ? 'Processing...'
                          : 'Approve'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveRejectId(user._id);
                          setRejectReason('');
                        }}
                        disabled={processingId === user._id}
                        className="rounded bg-red-100 px-4 py-2 font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VerificationManager;