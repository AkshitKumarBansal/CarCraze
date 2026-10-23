import { Navigate } from 'react-router-dom';

export default function AdminRoute({ children }) {
  // Adapt this lookup if your app stores the user elsewhere.
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    user = null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}