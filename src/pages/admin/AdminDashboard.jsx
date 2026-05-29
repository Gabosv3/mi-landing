import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({ mensajes: null, productos: null });

  useEffect(() => {
    const load = async () => {
      try {
        const [msgs, prods] = await Promise.all([
          getDocs(collection(db, "contacts")),
          getDocs(collection(db, "products")),
        ]);
        setCounts({ mensajes: msgs.size, productos: prods.size });
      } catch {
        setCounts({ mensajes: 0, productos: 0 });
      }
    };
    load();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";
  const firstName = user?.email?.split("@")[0] ?? "Admin";

  const STATS = [
    {
      to: "/admin/mensajes",
      value: counts.mensajes,
      label: "Mensajes",
      desc: "formulario de contacto",
      color: "#6366f1",
      bg: "#eef2ff",
      icon: "◉",
    },
    {
      to: "/admin/productos",
      value: counts.productos,
      label: "Productos",
      desc: "en catálogo",
      color: "#0ea5e9",
      bg: "#e0f2fe",
      icon: "❐",
    },
    {
      to: "/admin/contenido",
      value: 3,
      label: "Secciones",
      desc: "editables del sitio",
      color: "#10b981",
      bg: "#d1fae5",
      icon: "✦",
    },
  ];

  const ACTIONS = [
    { to: "/admin/contenido", label: "Editar contenido del sitio", icon: "✦", color: "#6366f1" },
    { to: "/admin/productos", label: "Agregar nuevo producto",      icon: "❐", color: "#0ea5e9" },
    { to: "/admin/mensajes",  label: "Revisar mensajes",           icon: "◉", color: "#10b981" },
    { to: "/",                label: "Ver sitio público",          icon: "↗", color: "#f59e0b" },
  ];

  return (
    <div className="ad-page">
      {/* Header */}
      <div className="ad-header">
        <div>
          <p className="ad-header__greeting">{greeting},</p>
          <h1 className="ad-header__title">{firstName}</h1>
        </div>
        <div className="ad-header__badge">
          <span className="ad-header__dot" />
          Sistema activo
        </div>
      </div>

      {/* Stats */}
      <div className="ad-stats">
        {STATS.map(({ to, value, label, desc, color, bg, icon }) => (
          <Link to={to} key={label} className="ad-stat" style={{ "--stat-color": color, "--stat-bg": bg }}>
            <div className="ad-stat__icon">{icon}</div>
            <div className="ad-stat__body">
              <span className="ad-stat__value">
                {value === null ? <span className="ad-stat__loading" /> : value}
              </span>
              <span className="ad-stat__label">{label}</span>
              <span className="ad-stat__desc">{desc}</span>
            </div>
            <span className="ad-stat__arrow">→</span>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="ad-section">
        <h2 className="ad-section__title">Acciones rápidas</h2>
        <div className="ad-actions">
          {ACTIONS.map(({ to, label, icon, color }) => (
            <Link to={to} key={label} className="ad-action" style={{ "--action-color": color }}>
              <span className="ad-action__icon">{icon}</span>
              <span className="ad-action__label">{label}</span>
              <span className="ad-action__arrow">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
