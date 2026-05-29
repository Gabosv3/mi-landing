import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const LINKS = [
  { to: "/admin/dashboard",   label: "Dashboard",    icon: "▣" },
  { to: "/admin/contenido",   label: "Contenido",    icon: "✦" },
  { to: "/admin/categorias",  label: "Categorías",   icon: "◈" },
  { to: "/admin/productos",   label: "Productos",    icon: "❐" },
  { to: "/admin/mensajes",    label: "Mensajes",     icon: "◉" },
];

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "AD";

  return (
    <aside className="as-sidebar">
      {/* Logo */}
      <div className="as-brand">
        <div className="as-brand__logo">DBM</div>
        <div className="as-brand__text">
          <span className="as-brand__title">DBM Admin</span>
          <span className="as-brand__sub">Panel de Control</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="as-nav">
        <p className="as-nav__label">Menú</p>
        {LINKS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `as-nav__link${isActive ? " as-nav__link--active" : ""}`
            }
          >
            <span className="as-nav__icon">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="as-footer">
        <div className="as-user">
          <div className="as-user__avatar">{initials}</div>
          <div className="as-user__info">
            <span className="as-user__email">{user?.email}</span>
            <span className="as-user__role">Administrador</span>
          </div>
        </div>
        <div className="as-footer__links">
          <NavLink to="/" className="as-footer__link">
            <span>↗</span> Ver sitio
          </NavLink>
          <button className="as-footer__link as-footer__logout" onClick={handleLogout}>
            <span>⏻</span> Salir
          </button>
        </div>
      </div>
    </aside>
  );
}
