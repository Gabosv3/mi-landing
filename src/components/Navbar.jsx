import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

const NAV_LINKS = [
  { label: "Inicio",            to: "/" },
  { label: "Productos",         to: "/productos" },
  { label: "Muebles a la Medida", to: "/muebles-a-la-medida" },
  { label: "Nosotros",          to: "/nosotros" },
  { label: "Contacto",          to: "/contacto" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className={`navbar${scrolled ? " navbar--scrolled" : ""}`}>
      <div className="navbar__inner">

        <NavLink to="/" className="navbar__logo" onClick={closeMenu}>
          <img
            src="/logo.png"
            alt="Distribuidora BM"
            className="navbar__logo-img"
            onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex"; }}
          />
          <span className="navbar__logo-fallback">
            <span className="navbar__logo-mark">BM</span>
            <small className="navbar__logo-sub">Distribuidora</small>
          </span>
        </NavLink>

        <ul className={`navbar__links${menuOpen ? " navbar__links--open" : ""}`}>
          {NAV_LINKS.map(({ label, to }) => (
            <li key={label}>
              <NavLink
                to={to}
                className={({ isActive }) => `navbar__link${isActive ? " navbar__link--active" : ""}`}
                onClick={closeMenu}
                end={to === "/"}
              >
                {label}
              </NavLink>
            </li>
          ))}
          <li>
            <NavLink to="/contacto" className="navbar__cta" onClick={closeMenu}>
              Pedir Cotización
            </NavLink>
          </li>
        </ul>

        <button
          className={`navbar__burger${menuOpen ? " navbar__burger--open" : ""}`}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Abrir menú"
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}
