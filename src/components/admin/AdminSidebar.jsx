import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NAV = [
  { to: "/admin/dashboard", label: "Dashboard", icon: "▣" },
  {
    label: "Sitio Web",
    icon: "◆",
    children: [
      { to: "/admin/home",     label: "Home",                icon: "⌂" },
      { to: "/admin/nosotros", label: "Nosotros",             icon: "❐" },
      { to: "/admin/contacto", label: "Contacto",             icon: "✉" },
      { to: "/admin/muebles",  label: "Muebles a la Medida",  icon: "◧" },
    ],
  },
  {
    label: "Catálogo",
    icon: "◈",
    children: [
      { to: "/admin/categorias", label: "Categorías", icon: "◈" },
      { to: "/admin/productos",  label: "Productos",  icon: "❐" },
    ],
  },
  { to: "/admin/mensajes", label: "Mensajes", icon: "◉" },
];

function NavItem({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `as-nav__link${isActive ? " as-nav__link--active" : ""}`
      }
    >
      <span className="as-nav__icon">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}

function NavGroup({ label, icon, children, isOpen, onToggle, hasActiveChild }) {
  return (
    <div className="as-nav__group">
      <button
        type="button"
        className={`as-nav__group-header${hasActiveChild ? " as-nav__group-header--active" : ""}`}
        onClick={onToggle}
      >
        <span className="as-nav__icon">{icon}</span>
        <span className="as-nav__group-label">{label}</span>
        <span className={`as-nav__chevron${isOpen ? " as-nav__chevron--open" : ""}`}>›</span>
      </button>
      {isOpen && (
        <div className="as-nav__group-children">
          {children.map((child) => (
            <NavItem key={child.to} {...child} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const groupHasActiveChild = (group) =>
    group.children?.some((c) => location.pathname.startsWith(c.to)) ?? false;

  const [openGroups, setOpenGroups] = useState(() => {
    const initial = {};
    NAV.forEach((item) => {
      if (item.children) initial[item.label] = groupHasActiveChild(item);
    });
    return initial;
  });

  const toggleGroup = (label) =>
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));

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
        {NAV.map((item) =>
          item.children ? (
            <NavGroup
              key={item.label}
              {...item}
              isOpen={!!openGroups[item.label]}
              onToggle={() => toggleGroup(item.label)}
              hasActiveChild={groupHasActiveChild(item)}
            />
          ) : (
            <NavItem key={item.to} {...item} />
          )
        )}
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
