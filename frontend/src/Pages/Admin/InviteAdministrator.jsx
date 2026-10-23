
import { useState } from 'react';
import axios from 'axios';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function InviteAdministrator() {
  const [email, setEmail] = useState('');
  const [invitationUrl, setInvitationUrl] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const createInvitation = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError('');
    setMessage('');
    setInvitationUrl('');
    setExpiresAt('');
    setCopied(false);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/admin-invitations`,
        { email: email.trim().toLowerCase() },
        { withCredentials: true }
      );

      const { token, expiresAt: expiry } = response.data;

      if (!token || !expiry) {
        throw new Error('Invitation token or expiry was not returned.');
      }

      const url = new URL(
        '/accept-admin-invitation',
        window.location.origin
      );
      url.searchParams.set('token', token);

      setInvitationUrl(url.toString());
      setExpiresAt(expiry);
      setMessage('Invitation created successfully.');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Could not create the invitation.'
      );
    } finally {
      setLoading(false);
    }
  };

  const copyInvitation = async () => {
    try {
      await navigator.clipboard.writeText(invitationUrl);
      setCopied(true);
      setError('');
    } catch {
      setError('Unable to copy the link. Please copy it manually.');
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            CarCraze Administration
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Invite Administrator
          </h1>
          <p className="mt-3 text-slate-600">
            Create a secure, single-use invitation for a new
            administrator.
          </p>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl text-blue-700">
            ✉
          </div>

          <form onSubmit={createInvitation} className="space-y-5">
            <div>
              <label
                htmlFor="invite-email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Administrator email address
              </label>

              <input
                id="invite-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating invitation...' : 'Create invitation'}
            </button>
          </form>

          {message && (
            <div
              role="status"
              className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
            >
              {message}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {invitationUrl && (
            <div className="mt-7 space-y-4 border-t border-slate-200 pt-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Invitation ready
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Send this link privately to the intended recipient.
                </p>
              </div>

              <label
                htmlFor="invitation-url"
                className="block text-sm font-semibold text-slate-700"
              >
                Invitation link
              </label>

              <input
                id="invitation-url"
                type="text"
                value={invitationUrl}
                readOnly
                onFocus={(event) => event.target.select()}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-200"
              />

              <button
                type="button"
                onClick={copyInvitation}
                className="w-full rounded-xl border border-blue-600 px-5 py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                {copied ? '✓ Link copied' : 'Copy invitation link'}
              </button>

              <div className="rounded-xl bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-900">
                  Invitation expiry
                </p>
                <p className="mt-1 text-sm text-amber-800">
                  {new Date(expiresAt).toLocaleString()}
                </p>
                <p className="mt-2 text-xs leading-5 text-amber-800">
                  The invitation token is sensitive and should not
                  be shared publicly. Expiry and single-use checks
                  are enforced by the backend.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
