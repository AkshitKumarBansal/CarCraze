
import { useEffect, useState } from 'react';
import {
  useNavigate,
  useSearchParams,
  useLocation,
} from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function AcceptAdminInvitation() {
  const { refreshAuth } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Capture the token before removing it from the URL.
  const [token] = useState(
    () => new URLSearchParams(window.location.search).get('token') || ''
  );

  // Remove the token from the visible URL while preserving other parameters.
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (params.has('token')) {
      params.delete('token');

      navigate(
        {
          pathname: location.pathname,
          search: params.toString() ? `?${params.toString()}` : '',
          hash: location.hash,
        },
        { replace: true }
      );
    }
  }, [location.pathname, location.search, location.hash, navigate]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setError('');
    setSuccess(false);

    if (!token) {
      setError(
        'The invitation token is missing. Please open the complete invitation link.'
      );
      return;
    }

    if (formData.password.length < 12) {
      setError('Your password must contain at least 12 characters.');
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        `${API_URL}/api/auth/admin-invitations/accept`,
        {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          phone: formData.phone.trim(),
          token,
        },
        {
          withCredentials: true,
        }
      );

      setSuccess(true);

      await refreshAuth();

      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to accept the invitation. It may have expired or already been used.'
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100';

  const labelClass =
    'mb-2 block text-sm font-semibold text-slate-700';

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
        <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-2xl text-red-700">
            !
          </div>

          <h1 className="text-2xl font-bold text-slate-900">
            Invalid invitation link
          </h1>

          <p className="mt-3 leading-6 text-slate-600">
            The invitation token is missing. Please open the complete
            invitation link you received.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white shadow-lg shadow-blue-200">
            C
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
            Accept Admin Invitation
          </h1>

          <p className="mt-3 text-slate-600">
            Complete your details to create your CarCraze administrator
            account.
          </p>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="firstName" className={labelClass}>
                First name
              </label>
              <input
                id="firstName"
                name="firstName"
                autoComplete="given-name"
                value={formData.firstName}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="Enter first name"
              />
            </div>

            <div>
              <label htmlFor="lastName" className={labelClass}>
                Last name
              </label>
              <input
                id="lastName"
                name="lastName"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="Enter last name"
              />
            </div>

            <div>
              <label htmlFor="email" className={labelClass}>
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="admin@example.com"
              />

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Use the same email address the invitation was created for.
              </p>
            </div>

            <div>
              <label htmlFor="phone" className={labelClass}>
                Phone number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="+919876543210"
              />
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>
                Create password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={12}
                value={formData.password}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="At least 12 characters"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-5 text-red-700"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
              >
                Account created successfully. Redirecting to the admin
                dashboard...
              </div>
            )}

            <button
              type="submit"
              disabled={loading || success}
              className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Create admin account'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs leading-5 text-slate-500">
            Your invitation must be valid, unexpired, and unused.
            The server verifies the invitation before assigning the
            administrator role.
          </p>
        </section>
      </div>
    </main>
  );
}