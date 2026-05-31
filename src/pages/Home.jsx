/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { db } from "../firebase/config";
import { useContent } from "../hooks/useContent";

const HOME_ICONS = {
  quality: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9.5 12 1.7 1.7 3.8-4" />
    </svg>
  ),
  shipping: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="1" y="4" width="12" height="11" rx="1" />
      <path d="M13 8h4l4 4v3h-8z" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
    </svg>
  ),
  support: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 13a8 8 0 0 1 16 0" />
      <rect x="2" y="12" width="4" height="7" rx="2" />
      <rect x="18" y="12" width="4" height="7" rx="2" />
      <path d="M12 21a3 3 0 0 0 3-3" />
    </svg>
  ),
  price: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="8" r="5" />
      <path d="M12 1v4" />
      <path d="M12 13v10" />
      <path d="M9 6.5h4a2 2 0 1 1 0 4h-2a2 2 0 1 0 0 4h4" />
    </svg>
  ),
  kitchen: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 6h16v12H4z" />
      <path d="M4 10h16" />
      <path d="M9 14h2" />
      <path d="M13 14h2" />
    </svg>
  ),
  sofa: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M5 11V9a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v2" />
      <path d="M3 11h18v6H3z" />
      <path d="M5 17v2" />
      <path d="M19 17v2" />
    </svg>
  ),
  appliance: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <path d="M9 7h6" />
      <circle cx="12" cy="16" r="2.5" />
    </svg>
  ),
  bedroom: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 11h18v6H3z" />
      <path d="M5 11V8h5a2 2 0 0 1 2 2v1" />
      <path d="M3 17v2" />
      <path d="M21 17v2" />
    </svg>
  ),
  dining: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M7 3v8" />
      <path d="M11 3v8" />
      <path d="M7 7h4" />
      <path d="M9 11v10" />
      <path d="M17 3c1.7 2 1.7 6 0 8" />
      <path d="M17 11v10" />
    </svg>
  ),
  box: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 3 3 7.5 12 12l9-4.5L12 3Z" />
      <path d="M3 7.5V16.5L12 21l9-4.5V7.5" />
      <path d="M12 12v9" />
    </svg>
  ),
  clean: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M6 21c0-5 3-8 8-12" />
      <path d="M14 4 20 10" />
      <path d="m12 6 6 6" />
    </svg>
  ),
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10.5V20h14v-9.5" />
      <path d="M9 20v-6h6v6" />
    </svg>
  ),
};

const PRODUCT_PLACEHOLDER = [
  {
    id: "placeholder-1",
    name: "Licuadora Oster",
    category: "Electrodomésticos",
    desc: "Equipos prácticos para tu cocina diaria.",
    price: "Consultar",
    image_url: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=900&q=80",
  },
  {
    id: "placeholder-2",
    name: "Batería de cocina",
    category: "Cocina",
    desc: "Piezas duraderas con acabados funcionales.",
    price: "Consultar",
    image_url: "https://images.unsplash.com/photo-1584990347449-a1f5b27b8435?w=900&q=80",
  },
  {
    id: "placeholder-3",
    name: "Canasta organizadora",
    category: "Organización",
    desc: "Soluciones para mantener cada espacio en orden.",
    price: "Consultar",
    image_url: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=900&q=80",
  },
  {
    id: "placeholder-4",
    name: "Juego de dormitorio",
    category: "Habitación",
    desc: "Confort y diseño para tu descanso.",
    price: "Consultar",
    image_url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&q=80&sat=-15",
  },
  {
    id: "placeholder-5",
    name: "Sala moderna",
    category: "Muebles",
    desc: "Estilo y funcionalidad para convivir mejor.",
    price: "Consultar",
    image_url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&q=80&crop=entropy&fit=crop&h=900",
  },
  {
    id: "placeholder-6",
    name: "Kit de limpieza",
    category: "Limpieza",
    desc: "Todo lo necesario para el cuidado del hogar.",
    price: "Consultar",
    image_url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&q=80",
  },
];

const CATEGORY_FALLBACK = [
  { label: "Cocina", icon: "kitchen", image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80" },
  { label: "Muebles", icon: "sofa", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80" },
  { label: "Electrodomésticos", icon: "appliance", image: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&q=80" },
  { label: "Habitación", icon: "bedroom", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80&sat=-10" },
  { label: "Comedor", icon: "dining", image: "https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=600&q=80" },
  { label: "Organización", icon: "box", image: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=600&q=80" },
  { label: "Limpieza", icon: "clean", image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80" },
];

const HOME_HERO_CONTENT = {
  eyebrow: "Todo para tu hogar",
  title: ["Productos para", "hacer de tu hogar", "el mejor lugar"],
  subtitle: "Encuentra una gran variedad de productos para tu hogar con la calidad, precio y atención que mereces.",
  primary: "Ver productos",
  secondary: "Cotizar ahora",
  trust: [
    { icon: "quality", label: "Calidad Garantizada" },
    { icon: "shipping", label: "Envíos Confiables" },
    { icon: "support", label: "Atención Personalizada" },
    { icon: "price", label: "Precios Competitivos" },
  ],
};

const HOME_ADVANTAGES = [
  { key: "quality", title: "Productos de Calidad", desc: "Seleccionamos lo mejor para tu hogar." },
  { key: "shipping", title: "Entregas Rápidas", desc: "Recibe tus productos en la puerta de tu casa." },
  { key: "support", title: "Atención Personalizada", desc: "Estamos aquí para ayudarte en cada paso." },
  { key: "price", title: "Cobertura en Todo El Salvador", desc: "Llegamos a donde estés." },
];

function HomeHero({ products }) {
  return (
    <section className="home2026__hero" id="inicio">
      <div className="home2026__hero-inner">
        <div className="home2026__hero-copy">
          <div className="home2026__eyebrow-wrap">
            <span className="home2026__eyebrow-line" />
            <span className="home2026__eyebrow">{HOME_HERO_CONTENT.eyebrow}</span>
          </div>

          <h1 className="home2026__title">
            {HOME_HERO_CONTENT.title.map((line) => (
              <span key={line} className="home2026__title-line">{line}</span>
            ))}
          </h1>

          <p className="home2026__subtitle">{HOME_HERO_CONTENT.subtitle}</p>

          <div className="home2026__actions">
            <Link to="/productos" className="home2026__btn home2026__btn--gold">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:"17px",height:"17px",flexShrink:0}} aria-hidden="true">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {HOME_HERO_CONTENT.primary}
            </Link>
            <Link to="/contacto" className="home2026__btn home2026__btn--ghost">
              <svg viewBox="0 0 24 24" fill="currentColor" style={{width:"17px",height:"17px",flexShrink:0}} aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M11.99 2C6.472 2 2 6.472 2 11.99c0 1.79.473 3.472 1.301 4.931L2 22l5.232-1.27A9.943 9.943 0 0 0 11.99 22C17.508 22 22 17.528 22 11.99 22 6.472 17.508 2 11.99 2zm0 18c-1.626 0-3.148-.444-4.452-1.217l-.318-.19-3.106.753.782-3.02-.207-.33A7.96 7.96 0 0 1 4 11.99C4 7.576 7.576 4 11.99 4 16.413 4 20 7.587 20 11.99 20 16.413 16.413 20 11.99 20z"/>
              </svg>
              {HOME_HERO_CONTENT.secondary}
            </Link>
          </div>
        </div>

        <div className="home2026__hero-visual">
          <img
            src="/imagenes/Home/Home1.png"
            alt="Espacio de cocina"
            className="home2026__hero-bg"
          />
          <div className="home2026__hero-fade" />
          <div className="home2026__hero-note">
            <span className="home2026__hero-note-icon">{HOME_ICONS.home}</span>
            <p>
              Todo lo que necesitas<br/> para tu hogar, en un <br/>
              <strong>solo lugar.</strong>
            </p>
          </div>
        </div>

        <div className="home2026__trust-row">
          {HOME_HERO_CONTENT.trust.map((item) => (
            <div className="home2026__trust-item" key={item.label}>
              <span className="home2026__trust-icon">{HOME_ICONS[item.icon]}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoriesRail({ categories }) {
  return (
    <section className="home2026__categories">
      <div className="home2026__section-titlebar">
        <span className="home2026__section-line" />
        <h2>Explora nuestras categorías</h2>
        <span className="home2026__section-line" />
      </div>

      <div className="home2026__categories-grid">
        {categories.map((category) => (
          <Link to="/productos" className="home2026__category-card" key={category.label}>
            <div className="home2026__category-thumb">
              <img src={category.image} alt={category.label} loading="lazy" />
            </div>
            <div className="home2026__category-meta">
              <span className="home2026__category-icon">{HOME_ICONS[category.icon]}</span>
              <strong>{category.label}</strong>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function AdvantageStrip({ featureItems }) {
  return (
    <section className="home2026__advantage-strip">
      {HOME_ADVANTAGES.map((item) => (
        <article className="home2026__advantage-item" key={item.title}>
          <span className="home2026__advantage-icon">{HOME_ICONS[item.key]}</span>
          <div>
            <strong>{item.title}</strong>
            <p>{item.desc}</p>
          </div>
        </article>
      ))}
    </section>
  );
}

function ProductsPreview({ products }) {
  return (
    <section className="home2026__products" id="productos-preview">
      <div className="home2026__shell">
        <div className="home2026__products-header">
          <div className="home2026__products-header-left">
            <div className="home2026__eyebrow-wrap">
              <span className="home2026__eyebrow-line"></span>
              <span className="home2026__eyebrow">Nuestro catálogo</span>
            </div>
            <h2 className="home2026__products-title">Productos destacados<br/>para tu hogar</h2>
            <p className="home2026__products-subtitle">
              Descubre una selección de productos elegidos por su<br/>
              calidad, funcionalidad y diseño para cada espacio de tu hogar.
            </p>
          </div>
          <Link to="/productos" className="home2026__btn home2026__btn--gold">
            Ver catálogo completo &rarr;
          </Link>
        </div>

        <div className="home2026__pgrid">
          {products.slice(0, 4).map((product) => (
            <article className="home2026__pcard" key={product.id}>
              <div className="home2026__pcard-imgwrap">
                {product.image_url
                  ? <img src={product.image_url} alt={product.name} loading="lazy" />
                  : <div className="home2026__pcard-ph" aria-hidden="true">◈</div>}
                <span className="home2026__pcard-tag">{product.category}</span>
              </div>
              <div className="home2026__pcard-body">
                <h3>{product.name}</h3>
                <p>{product.desc || product.description}</p>
                <div className="home2026__pcard-divider" />
                <span className="home2026__pcard-price">
                  Desde <strong>{product.price === "Consultar" ? "$39.99" : product.price}</strong>
                </span>
                <div className="home2026__pcard-actions">
                  <Link to="/productos" className="home2026__pbtn home2026__pbtn--outline">Ver detalle</Link>
                  <Link to="/contacto" className="home2026__pbtn home2026__pbtn--gold">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                    </svg>
                    Cotizar
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="home2026__pcallout">
          <div className="home2026__pcallout-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 11.5L12 4l9 7.5" />
              <path d="M5 10.5V20h14v-9.5" />
              <path d="M9 20v-6h6v6" />
              <circle cx="15" cy="9" r="1.5" />
            </svg>
          </div>
          <div className="home2026__pcallout-text">
            <h4>¿No encuentras lo que buscas?</h4>
            <p>Te ayudamos a conseguirlo.</p>
          </div>
          <Link to="/contacto" className="home2026__btn home2026__btn--outline home2026__pcallout-btn">
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style={{marginRight:"8px"}}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
            Escríbenos
          </Link>
        </div>
      </div>
    </section>
  );
}

function AboutPreview() {
  return (
    <section className="home2026__about" id="nosotros-preview">
      <div className="home2026__shell">
        <div className="home2026__about-main">
          <div className="home2026__about-text">
            <div className="home2026__eyebrow-wrap">
              <span className="home2026__eyebrow-line"></span>
              <span className="home2026__eyebrow" style={{textTransform: 'uppercase', letterSpacing: '0.05em'}}>Nuestra Historia</span>
            </div>
            <h2 className="home2026__about-title">Quiénes Somos</h2>
            <h3 className="home2026__about-subtitle">
              <span className="home2026__about-subtitle-line"></span>
              Más de 15 años<br/>
              impulsando hogares y negocios
            </h3>
            <p className="home2026__about-p">Distribuidora Briancesco Menjivar nació con la misión de conectar a los mejores proveedores con los negocios que más lo necesitan.</p>
            <p className="home2026__about-p">Desde 2009, trabajamos cada día para ofrecer productos de calidad, atención personalizada y soluciones confiables que generan valor y confianza.</p>
            <p className="home2026__about-highlight">Nuestra experiencia es tu tranquilidad.</p>
            
            <Link to="/nosotros" className="home2026__btn home2026__btn--gold home2026__about-btn">
              CONOCE MÁS DE NOSOTROS &rarr;
            </Link>
          </div>
          
          <div className="home2026__about-visual">
            <img src="https://images.unsplash.com/photo-1556761175-5973ef0f18d7?w=800&q=80" alt="Equipo BM" className="home2026__about-img" />
            <div className="home2026__about-badge">
              <div className="home2026__about-badge-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="#C08E3D" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <polygon points="12 15 9.06 16.54 9.62 13.27 7.24 10.96 10.53 10.48 12 7.5 13.47 10.48 16.76 10.96 14.38 13.27 14.94 16.54 12 15" stroke="#C08E3D" fill="none"/>
                </svg>
              </div>
              <div className="home2026__about-badge-text">
                <strong style={{fontFamily: 'var(--font-display)'}}>+15 AÑOS</strong>
                <span>DE EXPERIENCIA</span>
              </div>
            </div>
          </div>
        </div>

        <div className="home2026__about-stats">
          <div className="home2026__astat">
            <div className="home2026__astat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#C08E3D" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className="home2026__astat-info">
              <strong style={{fontFamily: 'var(--font-display)'}}>+500</strong>
              <span>Clientes satisfechos</span>
            </div>
          </div>

          <div className="home2026__astat-divider"></div>

          <div className="home2026__astat">
            <div className="home2026__astat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#C08E3D" strokeWidth="1.5">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <div className="home2026__astat-info">
              <strong style={{fontFamily: 'var(--font-display)'}}>+5,000</strong>
              <span>Productos disponibles</span>
            </div>
          </div>

          <div className="home2026__astat-divider"></div>

          <div className="home2026__astat">
            <div className="home2026__astat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#C08E3D" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
                <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="home2026__astat-info">
              <strong style={{fontFamily: 'var(--font-display)'}}>+15</strong>
              <span>Años de experiencia</span>
            </div>
          </div>

          <div className="home2026__astat-divider"></div>

          <div className="home2026__astat">
            <div className="home2026__astat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#C08E3D" strokeWidth="1.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <div className="home2026__astat-info">
              <strong style={{fontFamily: 'var(--font-display)'}}>Cobertura</strong>
              <span>Nacional</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

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

export default function Home() {
  const [products, setProducts] = useState(PRODUCT_PLACEHOLDER);

  useEffect(() => {
    getDocs(query(collection(db, "products"), limit(6)))
      .then((snap) => {
        if (!snap.empty) {
          setProducts(snap.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() })));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <main className="home2026">
      <HomeHero products={products} />
      
      <div className="home2026__shell">
        <CategoriesRail categories={CATEGORY_FALLBACK} />
        <AdvantageStrip />
      </div>

      <ProductsPreview products={products} />
      <AboutPreview />
      <CtaBanner />
    </main>
  );
}
