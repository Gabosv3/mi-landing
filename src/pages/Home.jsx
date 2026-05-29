import { useState, useEffect } from "react";
import { Link }               from "react-router-dom";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db }                from "../firebase/config";
import { useContent }        from "../hooks/useContent";
import Hero                  from "../components/Hero";
import Stats                 from "../components/Stats";

/* ── Previews de secciones ─────────────────────────────── */

/** Muestra solo las primeras 2 características */
function FeaturesPreview() {
  const { content } = useContent("features");
  const preview = content.slice(0, 2);
  return (
    <section className="features home-preview" id="servicios">
      <div className="features__inner">
        <div className="section-header home-preview__header">
          <span className="section-label">Por qué elegirnos</span>
          <h2>Lo que nos diferencia</h2>
          <Link to="/nosotros" className="home-preview__more">Ver todo →</Link>
        </div>
        <div className="features__grid features__grid--2">
          {preview.map((f, i) => (
            <article className="feature-card" key={i}>
              <span className="feature-card__num">{i === 0 ? "01" : "02"}</span>
              <span className="feature-card__icon">{f.icon}</span>
              <h3 className="feature-card__title">{f.title}</h3>
              <p className="feature-card__desc">{f.desc}</p>
              <span className="feature-card__arrow">→</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Muestra solo 3 productos sin filtros */
function ProductsPreview() {
  const PLACEHOLDER = [
    { id: 1, name: "Producto Ejemplo A", category: "Categoría 1", desc: "Descripción breve del producto disponible en nuestro catálogo.", price: "Consultar" },
    { id: 2, name: "Producto Ejemplo B", category: "Categoría 2", desc: "Descripción breve del producto disponible en nuestro catálogo.", price: "Consultar" },
    { id: 3, name: "Producto Ejemplo C", category: "Categoría 1", desc: "Descripción breve del producto disponible en nuestro catálogo.", price: "Consultar" },
  ];
  const [products, setProducts] = useState(PLACEHOLDER);

  useEffect(() => {
    getDocs(query(collection(db, "products"), limit(3)))
      .then((snap) => { if (!snap.empty) setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); })
      .catch(() => {});
  }, []);

  return (
    <section className="products home-preview" id="productos-preview">
      <div className="products__inner">
        <div className="section-header home-preview__header">
          <span className="section-label">Nuestro Catálogo</span>
          <h2>Productos Destacados</h2>
          <Link to="/productos" className="home-preview__more">Ver catálogo completo →</Link>
        </div>
        <div className="products__grid">
          {products.slice(0, 3).map((p) => (
            <article className="product-card" key={p.id}>
              <div className="product-card__img">
                {p.image_url
                  ? <img src={p.image_url} alt={p.name} loading="lazy" />
                  : <div className="product-card__placeholder" aria-hidden="true">◈</div>}
                <span className="product-card__tag">{p.category}</span>
              </div>
              <div className="product-card__body">
                <h3>{p.name}</h3>
                <p>{p.desc || p.description}</p>
                <div className="product-card__footer">
                  <span className="product-card__price">{p.price}</span>
                  <Link to="/contacto" className="btn btn--outline btn--sm">Cotizar</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="products__cta">
          <Link to="/productos" className="btn btn--solid">Ver Catálogo Completo</Link>
        </div>
      </div>
    </section>
  );
}

/** Teaser de Nosotros: título + 1 párrafo + valores + link */
function AboutPreview() {
  const { content } = useContent("about");
  const firstPara = content.text.split("\n\n")[0];
  return (
    <section className="about home-preview" id="nosotros-preview">
      <div className="about__inner">
        <div className="about__text">
          <div className="section-header">
            <span className="section-label">Nuestra Historia</span>
            <h2>{content.title}</h2>
          </div>
          <p>{firstPara}</p>
          <div className="about__values">
            {content.values.map((v, i) => (
              <span key={i} className="about__value-tag">{v}</span>
            ))}
          </div>
          <Link to="/nosotros" className="btn btn--outline" style={{ marginTop: "28px", display: "inline-block" }}>
            Conoce más de nosotros →
          </Link>
        </div>
        <div className="about__visual" aria-hidden="true">
          <div className="about__box">
            <div className="about__box-content">
              <span className="about__year">{content.foundingYear || "2009"}</span>
              <p>{content.foundingLabel || "Año de fundación"}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Banner CTA final */
function CtaBanner() {
  return (
    <section className="cta-banner">
      <div className="cta-banner__inner">
        <div className="cta-banner__text">
          <h2>¿Listo para hacer tu pedido?</h2>
          <p>Contáctanos hoy y recibe atención personalizada de nuestro equipo.</p>
        </div>
        <div className="cta-banner__actions">
          <Link to="/contacto" className="btn btn--solid">Solicitar Cotización</Link>
          <Link to="/productos" className="btn btn--outline cta-banner__link">Ver Catálogo</Link>
        </div>
      </div>
    </section>
  );
}

/* ── Página principal ──────────────────────────────────── */
export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <FeaturesPreview />
      <ProductsPreview />
      <AboutPreview />
      <CtaBanner />
    </>
  );
}
