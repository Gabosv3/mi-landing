import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../hooks/useContent';

const PROCESS = [
  { num: '01', title: 'Consulta Inicial', desc: 'Nos reunimos contigo para entender tu espacio, estilo y presupuesto. Sin compromiso.' },
  { num: '02', title: 'Diseño Personalizado', desc: 'Nuestros artesanos crean un diseño exclusivo con materiales seleccionados a tu gusto.' },
  { num: '03', title: 'Fabricación Artesanal', desc: 'Cada pieza es trabajada a mano con maderas 100% naturales, sin atajos ni materiales falsos.' },
  { num: '04', title: 'Entrega e Instalación', desc: 'Instalamos en tu hogar y te enseñamos el cuidado adecuado para que dure generaciones.' },
];

const WOODS = [
  { name: 'Cedro', trait: 'Aromático · Resistente a la humedad' },
  { name: 'Caoba', trait: 'Elegante · Alta durabilidad' },
  { name: 'Roble', trait: 'Fuerte · Veta característica' },
  { name: 'Pino', trait: 'Cálido · Versátil' },
];

export default function MueblesALaMedida() {
  const { content, loading } = useContent('muebles');

  useEffect(() => {
    document.body.classList.add('page--dark');
    return () => document.body.classList.remove('page--dark');
  }, []);

  if (loading) {
    return (
      <div className="ml-loading">
        <div className="ml-loading__ring" />
      </div>
    );
  }

  return (
    <div className="ml">

      {/* ══════════ HERO ══════════ */}
      <section className="ml__hero">
        {/* Full-width background image */}
        {content.heroBg && (
          <img src={content.heroBg} alt="" className="ml__hero-bg" />
        )}

        {/* Dark overlay */}
        <div className="ml__hero-overlay" aria-hidden="true" />

        {/* Gold arc decoration */}
        <svg className="ml__hero-arc" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="none">
          <defs>
            <linearGradient id="arcGold" x1="0" y1="900" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="rgba(201,164,100,0)" />
              <stop offset="20%"  stopColor="rgba(201,164,100,0.85)" />
              <stop offset="75%"  stopColor="rgba(232,201,122,0.9)" />
              <stop offset="100%" stopColor="rgba(201,164,100,0)" />
            </linearGradient>
            <filter id="arcGlow">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <path d="M -60 820 Q 360 520 720 340 Q 1040 180 1500 40"
                stroke="url(#arcGold)" strokeWidth="1.8" filter="url(#arcGlow)" />
        </svg>

        {/* Center content */}
        <div className="ml__hero-inner">
          {/* Logo */}
          <div className="ml__hero-brand">
            <img src="/logo.png" alt="BM Distribuidora Briancesco Mejivar" className="ml__hero-logo" />
          </div>

          <div className="ml__hero-badge">
            <span className="ml__hero-badge-line" />
            <span>100% Madera Natural · Hecho a Mano</span>
            <span className="ml__hero-badge-line" />
          </div>

          <h1 className="ml__hero-title">
            {content.title.split(' ').map((word, i, arr) => (
              <span key={i} className={i === arr.length - 1 ? 'ml__hero-word ml__hero-word--gold' : 'ml__hero-word'}>{word} </span>
            ))}
          </h1>

          <p className="ml__hero-sub">{content.subtitle}</p>

          <div className="ml__hero-actions">
            <Link to="/contacto" className="ml-btn ml-btn--gold">{content.cta_text}</Link>
            <a href="#proceso" className="ml-btn ml-btn--ghost">Ver proceso ↓</a>
          </div>
        </div>

        {/* Bottom feature bar */}
        <div className="ml__hero-bar">
          <div className="ml__hero-feat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2C9 2 7 5 7 8c0 4 5 10 5 10s5-6 5-10c0-3-2-6-5-6z"/><circle cx="12" cy="8" r="2"/></svg>
            <div><strong>MADERA 100%</strong><span>NATURAL</span></div>
          </div>
          <div className="ml__hero-feat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2a8 8 0 0 1-8-8 2 2 0 1 1 4 0"/></svg>
            <div><strong>HECHO A MANO</strong><span>POR EXPERTOS</span></div>
          </div>
          <div className="ml__hero-feat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            <div><strong>DISEÑO EXCLUSIVO</strong><span>Y PERSONALIZADO</span></div>
          </div>
          <div className="ml__hero-feat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <div><strong>CALIDAD QUE</strong><span>DURA GENERACIONES</span></div>
          </div>
        </div>
      </section>

      {/* ══════════ INTRO ══════════ */}
      <section className="ml__intro">
        <div className="ml__intro-inner">
          <div className="ml__intro-label">
            <div className="ml__gold-line" />
            <span>Nuestra Filosofía</span>
          </div>
          <div className="ml__intro-content">
            <h2 className="ml__intro-title">
              Cada mueble es una obra.<br />
              <em>No fabricamos en serie.</em>
            </h2>
            <div className="ml__intro-text">
              {content.description.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ MADERAS ══════════ */}
      <section className="ml__woods">
        <div className="ml__woods-inner">
          <div className="ml__section-header">
            <div className="ml__gold-line" />
            <span className="ml__section-label">Materiales</span>
          </div>
          <h2 className="ml__section-title">Trabajamos con las mejores maderas</h2>
          <div className="ml__woods-grid">
            {WOODS.map((w, i) => (
              <div className="ml__wood-card" key={i}>
                <div className="ml__wood-rings" aria-hidden="true">
                  <div /><div /><div />
                </div>
                <h3 className="ml__wood-name">{w.name}</h3>
                <p className="ml__wood-trait">{w.trait}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ SERVICIOS ══════════ */}
      <section className="ml__services">
        <div className="ml__services-inner">
          <div className="ml__section-header">
            <div className="ml__gold-line" />
            <span className="ml__section-label">Lo que fabricamos</span>
          </div>
          <h2 className="ml__section-title">{content.services.length > 0 ? 'Nuestros Servicios' : ''}</h2>
          <div className="ml__services-grid">
            {content.services.map((s, i) => (
              <div className="ml__service-card" key={i}>
                <span className="ml__service-num">0{i + 1}</span>
                <span className="ml__service-icon">{s.icon}</span>
                <h3 className="ml__service-title">{s.title}</h3>
                <p className="ml__service-desc">{s.desc}</p>
                <div className="ml__service-bar" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ PROCESO ══════════ */}
      <section className="ml__process" id="proceso">
        <div className="ml__process-inner">
          <div className="ml__section-header">
            <div className="ml__gold-line" />
            <span className="ml__section-label">Cómo trabajamos</span>
          </div>
          <h2 className="ml__section-title">Del boceto a tu hogar</h2>
          <div className="ml__process-steps">
            {PROCESS.map((step, i) => (
              <div className="ml__step" key={i}>
                <div className="ml__step-num">{step.num}</div>
                <div className="ml__step-connector" aria-hidden="true" />
                <div className="ml__step-body">
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ GALERÍA ══════════ */}
      {content.gallery.some(g => g.url) && (
        <section className="ml__gallery">
          <div className="ml__gallery-inner">
            <div className="ml__section-header">
              <div className="ml__gold-line" />
              <span className="ml__section-label">Trabajos realizados</span>
            </div>
            <h2 className="ml__section-title">Galería</h2>
            <div className="ml__gallery-grid">
              {content.gallery.filter(g => g.url).map((item, i) => (
                <figure className={`ml__gallery-item${i === 0 ? ' ml__gallery-item--featured' : ''}`} key={i}>
                  <img src={item.url} alt={item.caption} loading="lazy" />
                  <div className="ml__gallery-overlay">
                    {item.caption && <span>{item.caption}</span>}
                  </div>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════ CTA FINAL ══════════ */}
      <section className="ml__cta">
        <div className="ml__cta-grain" aria-hidden="true" />
        <div className="ml__cta-inner">
          <div className="ml__cta-deco" aria-hidden="true">◆</div>
          <h2 className="ml__cta-title">¿Listo para crear tu mueble ideal?</h2>
          <p className="ml__cta-sub">
            Cuéntanos tu idea y nosotros la convertimos en una pieza única de madera real,
            hecha a tu medida y con garantía de por vida.
          </p>
          <Link to="/contacto" className="ml-btn ml-btn--gold ml-btn--lg">{content.cta_text}</Link>
          <p className="ml__cta-note">Cotización gratuita · Sin compromiso · Respuesta en 24 h</p>
        </div>
      </section>

    </div>
  );
}
