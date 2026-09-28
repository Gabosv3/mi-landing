import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { useEffect, Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ConfirmProvider } from './context/ConfirmContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Cart from './components/Cart';
import PrivateRoute from './components/admin/PrivateRoute';

// Páginas públicas — cada una en su propio chunk, cargado solo cuando se visita
const Home             = lazy(() => import('./pages/Home'));
const Productos        = lazy(() => import('./pages/Productos'));
const ProductoDetalle  = lazy(() => import('./pages/ProductoDetalle'));
const Nosotros          = lazy(() => import('./pages/Nosotros'));
const Contacto          = lazy(() => import('./pages/Contacto'));
const MueblesALaMedida  = lazy(() => import('./pages/MueblesALaMedida'));

// Páginas admin — nunca se descargan para un visitante normal del sitio
const AdminLogin      = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout     = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard  = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminHome       = lazy(() => import('./pages/admin/AdminHome'));
const AdminNosotros   = lazy(() => import('./pages/admin/AdminNosotros'));
const AdminContacto   = lazy(() => import('./pages/admin/AdminContacto'));
const AdminMuebles    = lazy(() => import('./pages/admin/AdminMuebles'));
const AdminCategorias = lazy(() => import('./pages/admin/AdminCategorias'));
const AdminProductos  = lazy(() => import('./pages/admin/AdminProductos'));
const AdminCupones    = lazy(() => import('./pages/admin/AdminCupones'));
const AdminMensajes   = lazy(() => import('./pages/admin/AdminMensajes'));

import './App.css';

function RouteFallback() {
  return <div style={{ minHeight: '60vh' }} />;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function PublicLayout() {
  return (
    <>
      <Navbar />
      <Cart />
      <main><Outlet /></main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
        <ConfirmProvider>
          <ScrollToTop />
          <Suspense fallback={<RouteFallback />}>
          <Routes>
            {/* Rutas admin */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={<PrivateRoute><AdminLayout /></PrivateRoute>}
            >
              <Route index        element={<AdminDashboard />} />
              <Route path="dashboard"  element={<AdminDashboard />} />
              <Route path="home"        element={<AdminHome />} />
              <Route path="nosotros"    element={<AdminNosotros />} />
              <Route path="contacto"    element={<AdminContacto />} />
              <Route path="muebles"     element={<AdminMuebles />} />
              <Route path="categorias"  element={<AdminCategorias />} />
              <Route path="productos"   element={<AdminProductos />} />
              <Route path="cupones"     element={<AdminCupones />} />
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
          </Suspense>
        </ConfirmProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
