import { useContent } from '../hooks/useContent';
import React, { useEffect, useRef, useState } from 'react';

export default function About() {
  const { content, loading, error } = useContent('about');
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [sectionRef.current]);

  if (loading) {
    return (
      <section className="about" id="nosotros" ref={sectionRef}>
        <div className="about__container">
          <div className="about__skeleton about__skeleton-title" />
          <div className="about__skeleton about__skeleton-line" />
          <div className="about__skeleton about__skeleton-grid" />
        </div>
      </section>
    );
  }

  if (error || !content) {
    return (
      <section className="about" id="nosotros" ref={sectionRef}>
        <div className="about__error">
          <h3>No pudimos cargar la información</h3>
          <p>Por favor, intenta de nuevo más tarde.</p>
          <button onClick={() => window.location.reload()} className="about__retry">
            Reintentar
          </button>
        </div>
      </section>
    );
  }

  const {
    title = 'Más de 15 años construyendo confianza',
    lead = 'Somos una empresa salvadoreña dedicada a la distribución de muebles, electrodomésticos y productos para el hogar, comprometidos con ofrecer calidad, precios competitivos y un servicio excepcional.',
    text = '',
    mission = 'Brindar soluciones integrales para el hogar y los negocios mediante la distribución de productos de calidad, ofreciendo atención personalizada, disponibilidad inmediata y precios competitivos que generen valor a nuestros clientes.',
    vision = 'Ser una de las distribuidoras líderes de El Salvador, reconocida por su excelencia en servicio, innovación comercial y compromiso con el crecimiento de nuestros clientes.',
    values = ['Confianza', 'Calidad', 'Puntualidad', 'Atención Personalizada', 'Mejora Continua', 'Compromiso'],
    stats = [],
    foundingYear = '2009',
  } = content;

  const defaultParagraphs = [
    'Desde 2009, Distribuidora Briancesco Menjívar ha trabajado para convertirse en un aliado estratégico para familias, negocios y emprendedores de todo El Salvador.',
    'Durante más de quince años hemos fortalecido nuestra red de proveedores y ampliado nuestro catálogo de productos, manteniendo siempre nuestro compromiso con la calidad, la confianza y la satisfacción de nuestros clientes.',
    'Nuestro crecimiento se ha basado en relaciones duraderas, atención personalizada y una visión enfocada en el desarrollo comercial de nuestros socios.',
  ];

  const paragraphs = text ? text.split('\n\n').filter((p) => p.trim()) : defaultParagraphs;

  const aboutStats = stats.length > 0 ? stats : [
    { number: '+15', label: 'Años de experiencia', icon: '🏅' },
    { number: '+5000', label: 'Clientes satisfechos', icon: '👥' },
    { number: '+200', label: 'Productos disponibles', icon: '📦' },
    { number: '100%', label: 'Compromiso y respaldo', icon: '🛡️' },
  ];

  const valueInfo = {
    Confianza: ['🤝', 'Construimos relaciones duraderas basadas en honestidad y transparencia.'],
    Calidad: ['⭐', 'Seleccionamos productos que cumplen altos estándares para garantizar satisfacción.'],
    Puntualidad: ['⏱️', 'Cumplimos cada compromiso en tiempo y forma, porque valoramos su tiempo.'],
    'Atención Personalizada': ['👤', 'Escuchamos y entendemos las necesidades de cada cliente para ofrecer soluciones a la medida.'],
    'Mejora Continua': ['📈', 'Buscamos innovar constantemente nuestros procesos para ofrecer siempre lo mejor.'],
    Compromiso: ['♡', 'Trabajamos con pasión y dedicación para superar expectativas y generar valor real.'],
  };

  const reasons = [
    ['🏅', 'Más de 15 años de experiencia'],
    ['📦', 'Amplio catálogo de productos'],
    ['👤', 'Atención personalizada'],
    ['🏷️', 'Precios competitivos'],
    ['🚚', 'Disponibilidad inmediata'],
    ['🤝', 'Cobertura tradicional'],
    ['📍', 'Cobertura a nivel nacional'],
    ['🎧', 'Asesoría profesional'],
    ['🛡️', 'Respaldo y garantía'],
  ];

  const timeline = [
    ['2009', 'Fundación de la empresa con el objetivo de ofrecer productos de calidad y excelente servicio.'],
    ['2014', 'Expansión del catálogo e incorporación de nuevas líneas de productos para el hogar y negocios.'],
    ['2018', 'Fortalecimiento logístico y alianzas estratégicas con proveedores nacionales e internacionales.'],
    ['2022', 'Modernización comercial y digital para brindar una experiencia más ágil y eficiente.'],
    ['2026', 'Crecimiento y presencia nacional, reafirmando nuestro compromiso con El Salvador.'],
  ];

  return (
    <section
      ref={sectionRef}
      className="about"
      id="nosotros"
      aria-labelledby="about-title"
      itemScope
      itemType="https://schema.org/AboutPage"
    >
      <div className="about__container">
        <div className={`about__hero ${isVisible ? 'fade-in-up' : ''}`}>
          <div className="about__hero-content about__hero-left">
            <h2 id="about-title" itemProp="headline">{title}</h2>
            <p className="about__lead" itemProp="description">{lead}</p>

            <div className="about__hero-badges">
              <span className="about__badge">+15 Años</span>
              <span className="about__badge about__badge--muted">Respaldo nacional</span>
            </div>

            <div className="about__hero-ctas">
              <a href="#contacto" className="about__btn about__btn--dark">Contactarnos</a>
              <a href="#productos" className="about__btn about__btn--light">Ver productos</a>
            </div>
          </div>

          <div className="about__hero-visual about__hero-right" aria-hidden="true">
            <img src="/imagenes/Home/Home1.png" alt="Distribuidora BM - sede y logística" className="about__hero-img" />

            <div className="about__building" aria-hidden="true">
              <div className="about__building-top" />
              <div className="about__building-sign">BM</div>
              <div className="about__windows">
                <span /><span /><span /><span /><span /><span />
              </div>
              <div className="about__truck">
                <div className="about__truck-box">BM</div>
                <div className="about__truck-front" />
                <i /><b />
              </div>
              <div className="about__boxes"><span /><span /><span /></div>
            </div>
          </div>
        </div>

        <div className="about__history-grid">
          <article className={`about__history ${isVisible ? 'fade-in-up delay-1' : ''}`}>
            <div className="about__section-title about__section-title--left">
              <span>▣</span>
              <h3>Nuestra Historia</h3>
            </div>
            {paragraphs.map((para, index) => (
              <p key={index}>{para}</p>
            ))}
          </article>

          <div className={`about__gallery ${isVisible ? 'fade-in-up delay-2' : ''}`} aria-hidden="true">
            <div className="about__gallery-card about__gallery-card--warehouse">
              <span>Bodega y logística</span>
            </div>
            <div className="about__gallery-card about__gallery-card--service">
              <span>Atención al cliente</span>
            </div>
            <div className="about__gallery-card about__gallery-card--home">
              <span>Productos para el hogar</span>
            </div>
            <div className="about__gallery-card about__gallery-card--store">
              <span>Amplio inventario</span>
            </div>
          </div>
        </div>

        <div className={`about__stats ${isVisible ? 'fade-in-up delay-2' : ''}`}>
          {aboutStats.map((item, index) => (
            <div className="about__stat" key={`${item.label}-${index}`}>
              <span className="about__stat-icon">{item.icon || '◆'}</span>
              <strong>{item.number}</strong>
              <small>{item.label}</small>
            </div>
          ))}
        </div>

        <div className={`about__mission-vision ${isVisible ? 'fade-in-up delay-2' : ''}`}>
          <article className="about__mv-card about__mv-card--dark" itemProp="mission">
            <span className="about__mv-icon">◎</span>
            <div>
              <h3>Misión</h3>
              <p>{mission}</p>
            </div>
          </article>

          <article className="about__mv-card about__mv-card--gold" itemProp="vision">
            <span className="about__mv-icon">◉</span>
            <div>
              <h3>Visión</h3>
              <p>{vision}</p>
            </div>
          </article>
        </div>

        <div className={`about__values-block ${isVisible ? 'fade-in-up delay-2' : ''}`}>
          <div className="about__center-title">
            <span />
            <h3>Nuestros Valores</h3>
            <span />
          </div>

          <div className="about__values-grid">
            {values.map((value, index) => {
              const [icon, description] = valueInfo[value] || ['◇', 'Valor fundamental que guía nuestro trabajo diario.'];
              return (
                <article className="about__value-card" key={`${value}-${index}`}>
                  <span>{icon}</span>
                  <div>
                    <h4>{value}</h4>
                    <p>{description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className={`about__choose ${isVisible ? 'fade-in-up delay-3' : ''}`}>
          <div className="about__center-title">
            <span />
            <h3>¿Por qué elegirnos?</h3>
            <span />
          </div>

          <div className="about__reasons">
            {reasons.map(([icon, label]) => (
              <div className="about__reason" key={label}>
                <span>{icon}</span>
                <p>{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={`about__timeline-block ${isVisible ? 'fade-in-up delay-3' : ''}`}>
          <div className="about__center-title">
            <span />
            <h3>Nuestra Trayectoria</h3>
            <span />
          </div>

          <div className="about__timeline">
            {timeline.map(([year, description], index) => (
              <div className="about__time-item" key={year}>
                <div className="about__time-dot">{index + 1}</div>
                <strong>{year}</strong>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={`about__cta ${isVisible ? 'fade-in-up delay-3' : ''}`}>
          <div>
            <h3>¿Listo para trabajar con nosotros?</h3>
            <p>Permítanos ayudarle a encontrar los mejores productos para su hogar o negocio.</p>
          </div>
          <div className="about__cta-actions">
            <a href="#contacto" className="about__btn about__btn--dark">Contactarnos</a>
            <a href="#productos" className="about__btn about__btn--light">Ver productos</a>
          </div>
        </div>
      </div>

      <style>{`
        .about {
          --primary: #b9822e;
          --primary-dark: #8a5620;
          --gold-soft: #f7efe2;
          --surface: #ffffff;
          --cream: #fbf7ef;
          --dark: #121212;
          --text: #2f2f35;
          --muted: #666b75;
          --border: rgba(185, 130, 46, 0.24);
          --shadow: 0 24px 70px rgba(28, 24, 18, 0.08);
          background:
            radial-gradient(circle at 10% 5%, rgba(185, 130, 46, 0.12), transparent 24%),
            linear-gradient(180deg, #ffffff 0%, #fbf7ef 38%, #ffffff 100%);
          padding: 0;
          color: var(--text);
          overflow: hidden;
        }

        .about__container {
          width: min(1120px, calc(100% - 48px));
          margin: 40px auto;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(26px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .fade-in-up { animation: fadeInUp .7s ease forwards; }
        .delay-1 { animation-delay: .08s; }
        .delay-2 { animation-delay: .16s; }
        .delay-3 { animation-delay: .24s; }

        .about__hero {
          min-height: 420px;
          display: grid;
          grid-template-columns: 1fr 1.05fr;
          gap: 3.4rem;
          align-items: center;
          padding: 5rem 0 4rem;
        }

        .about__eyebrow {
          display: inline-block;
          color: var(--primary);
          font-size: .78rem;
          font-weight: 800;
          letter-spacing: .14em;
          text-transform: uppercase;
          margin-bottom: .9rem;
        }

        .about__hero h2 {
          max-width: 560px;
          margin: 0 0 1.25rem;
          color: var(--dark);
          font-size: clamp(2.25rem, 5vw, 4.25rem);
          line-height: .96;
          letter-spacing: -.045em;
          font-family: Georgia, 'Times New Roman', serif;
        }

        .about__lead {
          max-width: 560px;
          color: var(--text);
          font-size: 1.06rem;
          line-height: 1.75;
          margin: 0 0 1.25rem 0;
        }

        .about__stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.25rem;
          padding: 1.6rem 0 2rem;
          margin-top: 1.6rem;
          border-top: 1px solid var(--border);
        }

        .about__stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          padding: 1.2rem 1rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          box-shadow: 0 12px 30px rgba(18,18,20,0.04);
          text-align: center;
          opacity: 0;
          animation: fadeInUp 0.5s ease forwards;
        }

        .about__stat-icon {
          font-size: 1.6rem;
          color: var(--primary);
          display: block;
        }

        .about__stat-number,
        .about__stat strong {
          display: block;
          font-size: 2rem;
          font-weight: 800;
          color: var(--dark);
          line-height: 1;
        }

        .about__stat-label,
        .about__stat small {
          font-size: 0.92rem;
          color: var(--muted);
          margin-top: 0;
        }

        .about__hero-ctas {
          display: flex;
          gap: 0.9rem;
          margin-top: 1.4rem;
        }

        .about__hero-ctas .about__btn { padding: 0.85rem 1.4rem; border-radius: 10px; }

        .about__hero-visual {
          min-height: 330px;
          position: relative;
          display: grid;
          place-items: center;
        }

        .about__hero-img {
          width: 100%;
          height: 100%;
          max-width: 520px;
          object-fit: cover;
          border-radius: 18px;
          box-shadow: 0 18px 48px rgba(18,18,20,0.08);
          border: 1px solid rgba(0,0,0,0.06);
          display: block;
        }

        @media (max-width: 900px) {
          .about__hero-img { max-width: 100%; height: auto; }
        }

        .about__building {
          position: relative;
          height: 300px;
          border-radius: 28px;
          background: linear-gradient(135deg, #d9d5ce, #f7f4ef 45%, #bfb9b1);
          box-shadow: var(--shadow);
          overflow: hidden;
          border: 1px solid rgba(0,0,0,.08);
        }

        .about__building-top {
          position: absolute;
          top: 38px;
          right: 42px;
          width: 62%;
          height: 82px;
          background: linear-gradient(90deg, #2a2a2d, #4b4b50);
          border-radius: 4px;
        }

        .about__building-sign {
          position: absolute;
          top: 68px;
          right: 90px;
          width: 112px;
          height: 92px;
          display: grid;
          place-items: center;
          background: #171717;
          color: var(--primary);
          font-family: Georgia, 'Times New Roman', serif;
          font-weight: 900;
          font-size: 2rem;
          letter-spacing: .05em;
          border: 1px solid rgba(255,255,255,.2);
          box-shadow: 0 18px 35px rgba(0,0,0,.18);
        }

        .about__windows {
          position: absolute;
          left: 42px;
          top: 62px;
          display: grid;
          grid-template-columns: repeat(3, 82px);
          gap: 9px;
        }

        .about__windows span {
          height: 45px;
          background: linear-gradient(180deg, #9fb3c6, #e8f1f7);
          border: 4px solid #4a4b4e;
          opacity: .9;
        }

        .about__truck {
          position: absolute;
          left: 28px;
          bottom: 35px;
          width: 250px;
          height: 88px;
        }

        .about__truck-box {
          position: absolute;
          left: 0;
          bottom: 18px;
          width: 150px;
          height: 58px;
          border-radius: 8px 3px 3px 8px;
          background: #fff;
          border: 2px solid #d7d7d7;
          display: grid;
          place-items: center;
          color: var(--primary);
          font-family: Georgia, 'Times New Roman', serif;
          font-weight: 900;
          font-size: 1.45rem;
        }

        .about__truck-front {
          position: absolute;
          left: 150px;
          bottom: 18px;
          width: 72px;
          height: 58px;
          background: linear-gradient(135deg, #eeeeee, #cfd4d9);
          clip-path: polygon(0 0, 72% 0, 100% 45%, 100% 100%, 0 100%);
          border-radius: 3px 10px 8px 3px;
        }

        .about__truck i,
        .about__truck b {
          position: absolute;
          bottom: 5px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #171717;
          border: 5px solid #555;
        }

        .about__truck i { left: 35px; }
        .about__truck b { left: 172px; }

        .about__boxes {
          position: absolute;
          right: 36px;
          bottom: 34px;
          display: flex;
          align-items: flex-end;
          gap: 8px;
        }

        .about__boxes span {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #c89148, #e5bd77);
          border: 1px solid rgba(0,0,0,.12);
        }

        .about__boxes span:nth-child(2) { height: 70px; }
        .about__boxes span:nth-child(3) { height: 58px; }

        .about__history-grid {
          display: grid;
          grid-template-columns: .9fr 1.1fr;
          gap: 3rem;
          align-items: stretch;
          padding: 2.6rem 0 2rem;
        }

        .about__section-title,
        .about__center-title {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.35rem;
        }

        .about__section-title span {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: var(--primary);
          color: #fff;
          box-shadow: 0 12px 26px rgba(185, 130, 46, .22);
        }

        .about__section-title h3,
        .about__center-title h3 {
          margin: 0;
          color: var(--dark);
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(1.6rem, 3vw, 2.15rem);
          line-height: 1.1;
        }

        .about__history p {
          color: var(--text);
          line-height: 1.82;
          margin: 0 0 1.15rem;
          font-size: 1rem;
        }

        .about__gallery {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: .9rem;
        }

        .about__gallery-card {
          min-height: 160px;
          border-radius: 16px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 20px 48px rgba(18, 18, 20, .08);
          background-size: cover;
          background-position: center;
          border: 1px solid rgba(0,0,0,.06);
        }

        .about__gallery-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 20%, rgba(0,0,0,.52));
        }

        .about__gallery-card span {
          position: absolute;
          left: 16px;
          bottom: 14px;
          color: #fff;
          font-size: .82rem;
          font-weight: 800;
          letter-spacing: .04em;
          text-transform: uppercase;
        }

        .about__gallery-card--warehouse { background-image: url('/imagenes/Home/Home1.png'); }
        .about__gallery-card--service   { background-image: url('/imagenes/Home/Home1.png'); filter: saturate(.95) contrast(.98); }
        .about__gallery-card--home      { background-image: url('/imagenes/Home/Home1.png'); filter: brightness(.98); }
        .about__gallery-card--store     { background-image: url('/imagenes/Home/Home1.png'); filter: contrast(.95) saturate(.9); }

        .about__stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.25rem;
          padding: 1.6rem 0 2rem;
          margin-top: 1rem;
          border-top: 1px solid var(--border);
        }

        .about__stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          padding: 1.15rem 1rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          box-shadow: 0 12px 30px rgba(18,18,20,0.04);
          text-align: center;
          opacity: 0;
          animation: fadeInUp 0.5s ease forwards;
        }

        .about__stat-icon {
          font-size: 1.6rem;
          color: var(--primary);
          display: block;
        }

        .about__stat-number,
        .about__stat strong {
          display: block;
          font-size: 2rem;
          font-weight: 800;
          color: var(--dark);
          line-height: 1;
        }

        .about__stat-label,
        .about__stat small {
          font-size: 0.92rem;
          color: var(--muted);
          margin-top: 0;
        }

        .about__mission-vision {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          padding: .4rem 0 2.2rem;
        }

        .about__mv-card {
          display: grid;
          grid-template-columns: 70px 1fr;
          gap: 1rem;
          align-items: start;
          min-height: 170px;
          border-radius: 8px;
          padding: 2rem;
          overflow: hidden;
          position: relative;
        }

        .about__mv-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 85% 10%, rgba(255,255,255,.16), transparent 28%);
          pointer-events: none;
        }

        .about__mv-card--dark {
          background: linear-gradient(135deg, #111, #1d1d20);
          color: #fff;
        }

        .about__mv-card--gold {
          background: linear-gradient(135deg, #b67d2b, #c99343);
          color: #fff;
        }

        .about__mv-icon {
          font-size: 2.7rem;
          color: var(--primary);
        }

        .about__mv-card--gold .about__mv-icon { color: #fff; }

        .about__mv-card h3 {
          margin: 0 0 .7rem;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 1.85rem;
        }

        .about__mv-card p {
          margin: 0;
          line-height: 1.65;
          color: rgba(255,255,255,.92);
        }

        .about__center-title {
          justify-content: center;
          margin: .4rem 0 1.45rem;
        }

        .about__center-title span {
          width: 78px;
          height: 1px;
          background: var(--primary);
        }

        .about__values-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: .8rem;
        }

        .about__value-card {
          display: grid;
          grid-template-columns: 54px 1fr;
          gap: 1rem;
          padding: 1.35rem 1.4rem;
          min-height: 112px;
          border: 1px solid rgba(0,0,0,.08);
          border-radius: 10px;
          background: rgba(255,255,255,.82);
          box-shadow: 0 14px 36px rgba(28,24,18,.045);
          transition: transform .25s ease, box-shadow .25s ease;
        }

        .about__value-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 22px 48px rgba(28,24,18,.08);
        }

        .about__value-card > span {
          font-size: 2.1rem;
          color: var(--primary);
          line-height: 1;
        }

        .about__value-card h4 {
          margin: 0 0 .42rem;
          color: var(--dark);
          font-size: 1rem;
        }

        .about__value-card p {
          margin: 0;
          line-height: 1.48;
          color: var(--muted);
          font-size: .88rem;
        }

        .about__choose {
          padding: 2.1rem 0 1rem;
        }

        .about__reasons {
          display: grid;
          grid-template-columns: repeat(9, 1fr);
          gap: .75rem;
        }

        .about__reason {
          text-align: center;
          display: grid;
          justify-items: center;
          gap: .55rem;
        }

        .about__reason span {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          color: var(--primary);
          border: 1px solid rgba(185,130,46,.32);
          font-size: 1.55rem;
          background: rgba(255,255,255,.65);
        }

        .about__reason p {
          margin: 0;
          color: var(--dark);
          font-size: .78rem;
          line-height: 1.35;
          font-weight: 700;
        }

        .about__timeline-block {
          padding: 2.15rem 0 3rem;
        }

        .about__timeline {
          position: relative;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1rem;
        }

        .about__timeline::before {
          content: '';
          position: absolute;
          left: 8%;
          right: 8%;
          top: 31px;
          height: 2px;
          background: var(--primary);
        }

        .about__time-item {
          position: relative;
          text-align: center;
          padding-top: 0;
          z-index: 1;
        }

        .about__time-dot {
          width: 62px;
          height: 62px;
          margin: 0 auto .7rem;
          border-radius: 50%;
          display: grid;
          place-items: center;
          border: 2px solid var(--primary);
          background: #fff;
          color: var(--dark);
          font-weight: 900;
          box-shadow: 0 10px 28px rgba(28,24,18,.08);
        }

        .about__time-item strong {
          display: block;
          color: var(--dark);
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 1.55rem;
          margin-bottom: .4rem;
        }

        .about__time-item p {
          margin: 0 auto;
          max-width: 175px;
          color: var(--muted);
          font-size: .78rem;
          line-height: 1.45;
        }

        .about__cta {
          margin: 0 calc(50% - 50vw);
          padding: 1.6rem max(24px, calc((100vw - 1120px) / 2));
          background: linear-gradient(135deg, #bd812d, #d4a24e);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          color: #fff;
        }

        .about__cta h3 {
          margin: 0 0 .35rem;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 1.9rem;
        }

        .about__cta p {
          margin: 0;
          color: rgba(255,255,255,.92);
        }

        .about__cta-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .about__btn {
          min-width: 180px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: .95rem 1.5rem;
          border-radius: 6px;
          text-decoration: none;
          text-transform: uppercase;
          font-size: .8rem;
          font-weight: 900;
          letter-spacing: .04em;
        }

        .about__btn--dark {
          background: #111;
          color: #fff;
        }

        .about__btn--light {
          background: #fff;
          color: #111;
        }

        .about__error {
          text-align: center;
          padding: 5rem 1.5rem;
        }

        .about__retry {
          background: var(--primary);
          color: #fff;
          border: 0;
          border-radius: 8px;
          padding: .8rem 1.4rem;
          cursor: pointer;
          font-weight: 800;
        }

        .about__skeleton {
          background: linear-gradient(90deg, #eee 25%, #f8f8f8 50%, #eee 75%);
          background-size: 200% 100%;
          animation: skeleton 1.3s infinite;
          border-radius: 14px;
        }

        @keyframes skeleton {
          from { background-position: 200% 0; }
          to { background-position: -200% 0; }
        }

        .about__skeleton-title { height: 80px; width: 50%; margin: 4rem 0 1rem; }
        .about__skeleton-line { height: 22px; width: 70%; margin-bottom: 2rem; }
        .about__skeleton-grid { height: 360px; width: 100%; margin-bottom: 4rem; }

        @media (max-width: 1024px) {
          .about__hero,
          .about__history-grid,
          .about__mission-vision {
            grid-template-columns: 1fr;
          }

          .about__hero {
            padding-top: 3rem;
          }

          .about__stats,
          .about__values-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .about__reasons {
            grid-template-columns: repeat(3, 1fr);
            row-gap: 1.4rem;
          }

          .about__timeline {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }

          .about__timeline::before {
            display: none;
          }

          .about__time-item p {
            max-width: 420px;
          }
        }

        @media (max-width: 640px) {
          .about__container {
            width: min(100% - 28px, 1120px);
          }

          .about__hero {
            min-height: auto;
            gap: 2rem;
            padding: 2.5rem 0 2rem;
          }

          .about__hero h2 {
            font-size: 2.55rem;
          }

          .about__hero-visual {
            min-height: 240px;
          }

          .about__building {
            height: 235px;
          }

          .about__windows {
            grid-template-columns: repeat(2, 62px);
            left: 22px;
            top: 48px;
          }

          .about__building-top {
            width: 62%;
            right: 18px;
          }

          .about__building-sign {
            right: 34px;
            width: 84px;
            height: 72px;
            font-size: 1.45rem;
          }

          .about__truck {
            transform: scale(.78);
            transform-origin: left bottom;
            left: 14px;
            bottom: 22px;
          }

          .about__gallery,
          .about__stats,
          .about__values-grid {
            grid-template-columns: 1fr;
          }

          .about__stat {
            justify-content: center;
            text-align: center;
          }

          .about__mv-card {
            grid-template-columns: 1fr;
            padding: 1.55rem;
          }

          .about__reasons {
            grid-template-columns: repeat(2, 1fr);
          }

          .about__center-title span {
            width: 38px;
          }

          .about__cta {
            flex-direction: column;
            align-items: flex-start;
          }

          .about__cta-actions,
          .about__btn {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
