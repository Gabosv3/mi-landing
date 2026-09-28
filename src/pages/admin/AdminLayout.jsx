import { Outlet, Navigate, useLocation } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { profile } = useAuth();
  const { pathname } = useLocation();

  if (profile === undefined) {
    return <div className="admin-splash">Cargando…</div>;
  }

  // Un vendedor solo puede ver su propio panel de ventas.
  if (profile?.role === 'vendedor' && pathname !== '/admin/ventas') {
    return <Navigate to="/admin/ventas" replace />;
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
}
