import { Link } from "react-router-dom";
import { useContent } from "../hooks/useContent";

const NAV_ROUTES = [
  { label: "Inicio",    to: "/" },
  { label: "Productos", to: "/productos" },
  { label: "Nosotros",  to: "/nosotros" },
  { label: "Contacto",  to: "/contacto" },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const { content } = useContent("contact");

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__top">
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <span>DBM</span>
              <small>Distribuidora Briancesco Menjivar</small>
            </Link>
            <p>Tu socio comercial de confianza. Calidad, puntualidad y servicio personalizado en El Salvador.</p>
          </div>

          <div className="footer__nav">
            <div>
              <h4>Navegación</h4>
              <ul>
                {NAV_ROUTES.map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Contacto</h4>
              <ul>
                <li><a href={`tel:${content.phone}`}>{content.phone}</a></li>
                <li><a href={`mailto:${content.email}`}>{content.email}</a></li>
                <li>{content.address}</li>
                <li>{content.hours}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© {year} Distribuidora Briancesco Menjivar. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
