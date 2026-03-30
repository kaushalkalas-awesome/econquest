/** Require authentication */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const loc = useLocation();

  if (loading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: loc }} />;
  return children;
}
