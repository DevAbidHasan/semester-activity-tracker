import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

/**
 * @param {object} props
 * @param {boolean} [props.adminOnly] — only `role === 'admin'`
 * @param {boolean} [props.studentOnly] — only `role === 'user'` (blocks admins from student app)
 */
export default function ProtectedRoute({ adminOnly, studentOnly }) {
  const { isAuthenticated, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/student" replace />;
  }

  if (studentOnly && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
