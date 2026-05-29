import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/admin/PrivateRoute';

// Páginas públicas
import Home             from './pages/Home';
import Productos        from './pages/Productos';
import ProductoDetalle  from './pages/ProductoDetalle';
import Nosotros           from './pages/Nosotros';
import Contacto           from './pages/Contacto';
import MueblesALaMedida   from './pages/MueblesALaMedida';

// Páginas admin
import AdminLogin      from './pages/admin/AdminLogin';
import AdminLayout     from './pages/admin/AdminLayout';
import AdminDashboard  from './pages/admin/AdminDashboard';
import AdminContenido  from './pages/admin/AdminContenido';
import AdminCategorias from './pages/admin/AdminCategorias';
import AdminProductos  from './pages/admin/AdminProductos';
import AdminMensajes   from './pages/admin/AdminMensajes';

import './App.css';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function PublicLayout() {
  return (
    <>
      <Navbar />
      <main><Outlet /></main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          {/* Rutas admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={<PrivateRoute><AdminLayout /></PrivateRoute>}
          >
            <Route index        element={<AdminDashboard />} />
            <Route path="dashboard"  element={<AdminDashboard />} />
            <Route path="contenido"   element={<AdminContenido />} />
            <Route path="categorias"  element={<AdminCategorias />} />
            <Route path="productos"   element={<AdminProductos />} />
            <Route path="mensajes"    element={<AdminMensajes />} />
          </Route>

          {/* Rutas públicas */}
          <Route element={<PublicLayout />}>
            <Route path="/"          element={<Home />} />
            <Route path="/productos"     element={<Productos />} />
            <Route path="/productos/:id"        element={<ProductoDetalle />} />
            <Route path="/muebles-a-la-medida" element={<MueblesALaMedida />} />
            <Route path="/nosotros"             element={<Nosotros />} />
            <Route path="/contacto"  element={<Contacto />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
