import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function PrivateRoute({ children }) {
  const { user } = useAuth();

  if (user === undefined) {
    return <div className="admin-splash">Cargando…</div>;
  }

  return user ? children : <Navigate to="/admin/login" replace />;
}
