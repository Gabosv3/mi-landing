import { Link } from "react-router-dom";
import { useContent } from "../hooks/useContent";

export default function Hero() {
  const { content } = useContent("hero");

  return (
    <section className="hero" id="inicio">
      <div className="hero__dot-bg" aria-hidden="true" />

      <div className="hero__inner">
        {/* Left: text */}
        <div className="hero__text">
          <span className="hero__badge">{content.badge}</span>

          <h1 className="hero__title">
            {content.title.split("\n").map((line, i) => (
              <span key={i} className="hero__title-line">{line}</span>
            ))}
          </h1>

          <p className="hero__subtitle">{content.subtitle}</p>

          <div className="hero__actions">
            <Link to="/productos" className="btn btn--solid">{content.cta_primary}</Link>
            <Link to="/contacto" className="btn btn--outline">{content.cta_secondary}</Link>
          </div>

          <div className="hero__trust">
            <span className="hero__trust-item">
              <span className="hero__trust-dot" />
              +15 años de experiencia
            </span>
            <span className="hero__trust-item">
              <span className="hero__trust-dot" />
              +500 clientes activos
            </span>
            <span className="hero__trust-item">
              <span className="hero__trust-dot" />
              El Salvador
            </span>
          </div>
        </div>

        {/* Right: logo visual */}
        <div className="hero__visual">
          <div className="hero__logo-frame">
            <div className="hero__logo-frame-deco" aria-hidden="true" />
            <img
              src="/logo.png"
              alt="Distribuidora Briancesco Mejivar"
              className="hero__logo-img"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextSibling.style.display = "flex";
              }}
            />
            <div className="hero__logo-fallback-visual">
              <span>BM</span>
              <small>Distribuidora Briancesco Mejivar</small>
            </div>
            <div className="hero__logo-tag">Productos para el Hogar</div>
          </div>
        </div>
      </div>

      <div className="hero__scroll-indicator" aria-hidden="true">
        <span>Scroll</span>
        <div className="hero__scroll-line" />
      </div>
    </section>
  );
}
