import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";

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
  const { cart, setIsCartOpen } = useCart();
  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

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
        </ul>

        <div className="navbar__right">
          <NavLink to="/contacto" className="navbar__cta" onClick={closeMenu}>
            <svg viewBox="0 0 24 24" fill="currentColor" style={{width:"18px",height:"18px",flexShrink:0}} aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M11.99 2C6.472 2 2 6.472 2 11.99c0 1.79.473 3.472 1.301 4.931L2 22l5.232-1.27A9.943 9.943 0 0 0 11.99 22C17.508 22 22 17.528 22 11.99 22 6.472 17.508 2 11.99 2zm0 18c-1.626 0-3.148-.444-4.452-1.217l-.318-.19-3.106.753.782-3.02-.207-.33A7.96 7.96 0 0 1 4 11.99C4 7.576 7.576 4 11.99 4 16.413 4 20 7.587 20 11.99 20 16.413 16.413 20 11.99 20z"/>
            </svg>
            Contacto
          </NavLink>
          <button className="navbar__cart-btn" onClick={() => setIsCartOpen(true)} aria-label="Abrir carrito">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:"24px",height:"24px"}}>
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {cartItemsCount > 0 && (
              <span className="navbar__cart-badge">{cartItemsCount}</span>
            )}
          </button>
        </div>

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
