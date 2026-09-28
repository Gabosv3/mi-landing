import { Link } from "react-router-dom";
import { useContent } from "../hooks/useContent";

const NAV_ROUTES = [
  { label: "Inicio",    to: "/" },
  { label: "Productos", to: "/productos" },
  { label: "Nosotros",  to: "/nosotros" },
  { label: "Contacto",  to: "/contacto" },
];

const SOCIAL_ICONS = {
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.89h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94z"/></svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.6 5.82c-.9-.98-1.4-2.26-1.4-3.62h-3.1v13.44c0 1.62-1.32 2.94-2.94 2.94a2.94 2.94 0 0 1 0-5.88c.3 0 .6.05.87.13V9.7a6.07 6.07 0 0 0-.87-.06 6.06 6.06 0 1 0 6.06 6.06V9.35a8.02 8.02 0 0 0 4.44 1.34V7.6a4.85 4.85 0 0 1-3.06-1.78z"/></svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.99 2C6.472 2 2 6.472 2 11.99c0 1.79.473 3.472 1.301 4.931L2 22l5.232-1.27A9.943 9.943 0 0 0 11.99 22C17.508 22 22 17.528 22 11.99 22 6.472 17.508 2 11.99 2zm0 18c-1.626 0-3.148-.444-4.452-1.217l-.318-.19-3.106.753.782-3.02-.207-.33A7.96 7.96 0 0 1 4 11.99C4 7.576 7.576 4 11.99 4 16.413 4 20 7.587 20 11.99 20 16.413 16.413 20 11.99 20z"/></svg>
  ),
};

const SOCIAL_KEYS = ["facebook", "instagram", "tiktok", "whatsapp"];

export default function Footer() {
  const year = new Date().getFullYear();
  const { content, loading: contentLoading } = useContent("contact");

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
            {!contentLoading && (
              <div className="footer__social">
                {SOCIAL_KEYS.filter((key) => content[key]?.trim()).map((key) => (
                  <a
                    key={key}
                    href={content[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer__social-link"
                    aria-label={key}
                  >
                    {SOCIAL_ICONS[key]}
                  </a>
                ))}
              </div>
            )}
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
            {!contentLoading && (
              <div>
                <h4>Contacto</h4>
                <ul>
                  <li><a href={`tel:${content.phone}`}>{content.phone}</a></li>
                  <li><a href={`mailto:${content.email}`}>{content.email}</a></li>
                  <li>{content.address}</li>
                  <li>{content.hours}</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="footer__bottom">
          <p>© {year} Distribuidora Briancesco Menjivar. Todos los derechos reservados.</p>
          <p className="footer__credit">Desarrollado por <span>Gabosv</span></p>
        </div>
      </div>
    </footer>
  );
}
