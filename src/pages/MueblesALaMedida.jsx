import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../hooks/useContent';

const PROCESS_ICONS = {
  consulta: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4h9a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2z"/>
      <path d="M15 4h5v10"/>
      <path d="M8 9h4"/>
      <path d="M8 13h3"/>
      <path d="M18 19l3-3"/>
      <path d="M17 14l4 4"/>
    </svg>
  ),
  diseno: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="18" height="13" rx="2"/>
      <path d="M8 20h8"/>
      <path d="M12 17v3"/>
      <path d="M7 8h10"/>
      <path d="M9 11h6"/>
    </svg>
  ),
  fabricacion: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 7l4-2 4 2v4l-4 2-4-2z"/>
      <path d="M13 11l4-2 4 2v4l-4 2-4-2z"/>
      <path d="M7 13v4l4 2"/>
      <path d="M17 13v4"/>
    </svg>
  ),
  entrega: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="5" width="13" height="11" rx="1"/>
      <path d="M14 9h4l4 4v3h-8z"/>
      <circle cx="6" cy="18" r="2"/>
      <circle cx="18" cy="18" r="2"/>
    </svg>
  ),
  mensaje: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      <path d="M8 9h8"/>
      <path d="M8 13h5"/>
    </svg>
  ),
  vista3d: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 7l8-4 8 4-8 4z"/>
      <path d="M4 7v10l8 4 8-4V7"/>
      <path d="M12 11v10"/>
    </svg>
  ),
  hoja: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
      <path d="M2 21c0-3 1.85-5.36 5.08-6"/>
    </svg>
  ),
  hogar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 11.5L12 4l9 7.5"/>
      <path d="M5 10.5V20h14v-9.5"/>
      <path d="M9 20v-6h6v6"/>
    </svg>
  ),
  escudo: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  arbol: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 3c3.2 0 5.7 2.1 6.4 5.2A4.8 4.8 0 0 1 17 17h-3v4"/>
      <path d="M12 3C8.8 3 6.3 5.1 5.6 8.2A4.8 4.8 0 0 0 7 17h5"/>
      <path d="M12 21h0"/>
    </svg>
  ),
  sello: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="10" r="6"/>
      <path d="M8.5 15.5L7 21l5-2 5 2-1.5-5.5"/>
    </svg>
  ),
  herramientas: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l2.8-2.8a6 6 0 0 1-7.8 7.8L5 22l-3-3 7.7-7.7a6 6 0 0 1 7.8-7.8z"/>
      <path d="M8 3l13 13"/>
    </svg>
  ),
  calendario: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="5" width="18" height="16" rx="2"/>
      <path d="M16 3v4"/>
      <path d="M8 3v4"/>
      <path d="M3 10h18"/>
      <path d="M9 14h3"/>
    </svg>
  ),
};

const PROCESS = [
  {
    num: '01',
    title: 'Consulta Inicial',
    desc: 'Nos reunimos contigo para entender tu espacio, estilo y presupuesto. Sin compromiso.',
    image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=900&q=80',
    icon: 'consulta',
    noteIcon: 'mensaje',
    note: 'Escuchamos tus ideas y necesidades para crear la mejor solución.',
  },
  {
    num: '02',
    title: 'Diseño Personalizado',
    desc: 'Creamos una propuesta de diseño exclusiva y una vista 3D para que visualices cada detalle.',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&q=80',
    icon: 'diseno',
    noteIcon: 'vista3d',
    note: 'Ajustamos cada detalle contigo hasta que sea exactamente lo que imaginas.',
  },
  {
    num: '03',
    title: 'Fabricación Artesanal',
    desc: 'Cada pieza es trabajada a mano con maderas 100% naturales, sin atajos ni materiales falsos.',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=900&q=80',
    icon: 'fabricacion',
    noteIcon: 'hoja',
    note: 'Artesanía, precisión y pasión en cada corte, unión y acabado.',
  },
  {
    num: '04',
    title: 'Entrega e Instalación',
    desc: 'Llevamos y montamos tu mueble en tu hogar con el cuidado adecuado para que dure generaciones.',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&q=80&sat=-20',
    icon: 'entrega',
    noteIcon: 'hogar',
    note: 'Instalación profesional y acompañamiento incluso después de la entrega.',
  },
];

const PROCESS_ASSURANCES = [
  { icon: 'escudo', title: 'Diseños 100% personalizados', desc: 'Hechos a la medida de tu espacio y estilo.' },
  { icon: 'arbol', title: 'Maderas Premium', desc: 'Seleccionamos solo maderas de la más alta calidad.' },
  { icon: 'sello', title: 'Garantía de Calidad', desc: 'Respaldamos nuestro trabajo con garantía.' },
  { icon: 'herramientas', title: 'Instalación Profesional', desc: 'Equipo especializado para un acabado perfecto.' },
];

const TRAIT_ICONS = {
  agua: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
    </svg>
  ),
  escudo: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  hoja: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
      <path d="M2 21c0-3 1.85-5.36 5.08-6"/>
    </svg>
  ),
  diamante: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"/>
    </svg>
  ),
  paleta: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  fuerza: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
      <line x1="4" y1="22" x2="4" y2="15"/>
    </svg>
  ),
  reloj: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  arbol: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17 14l-5-10-5 10H3l9 7 9-7z"/>
    </svg>
  ),
  pluma: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/>
      <line x1="16" y1="8" x2="2" y2="22"/>
      <line x1="17.5" y1="15" x2="9" y2="15"/>
    </svg>
  ),
  pulgar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 1 0-2-2.3z"/>
      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
    </svg>
  ),
  precio: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
};

const WOODS = [
  {
    name: 'Cedro',
    badge: 'Premium',
    badgeType: 'premium',
    rating: 5,
    desc: 'Aromático y naturalmente resistente a la humedad y a las plagas.',
    traits: [
      { icon: 'agua',   label: 'Resistente\na humedad' },
      { icon: 'escudo', label: 'Alta\ndurabilidad' },
      { icon: 'hoja',   label: 'Aroma\nnatural' },
    ],
    ideal: 'Closets, puertas y muebles finos',
    img: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=600&q=80',
  },
  {
    name: 'Caoba',
    badge: 'Premium',
    badgeType: 'premium',
    rating: 5,
    desc: 'Elegancia y sofisticación en cada veta, perfecta para muebles de lujo.',
    traits: [
      { icon: 'diamante', label: 'Acabado\nexcepcional' },
      { icon: 'escudo',   label: 'Muy alta\ndurabilidad' },
      { icon: 'paleta',   label: 'Color cálido\ny profundo' },
    ],
    ideal: 'Muebles de lujo, oficinas, libreros',
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  },
  {
    name: 'Roble',
    badge: 'Alta gama',
    badgeType: 'alta',
    rating: 4.5,
    desc: 'Fuerte y resistente, con vetas marcadas que aportan carácter y estilo.',
    traits: [
      { icon: 'fuerza', label: 'Alta\nresistencia' },
      { icon: 'reloj',  label: 'Larga\nvida útil' },
      { icon: 'arbol',  label: 'Veta\ncaracterística' },
    ],
    ideal: 'Comedores, escritorios, pisos',
    img: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=600&q=80',
  },
  {
    name: 'Pino',
    badge: 'Económica',
    badgeType: 'eco',
    rating: 4,
    desc: 'Versátil y cálida, ideal para proyectos funcionales y personalizados.',
    traits: [
      { icon: 'pluma',  label: 'Ligera' },
      { icon: 'pulgar', label: 'Fácil de\ntrabajar' },
      { icon: 'precio', label: 'Excelente\nprecio' },
    ],
    ideal: 'Muebles juveniles, repisas, proyectos a medida',
    img: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=600&q=80',
  },
];

const SERVICE_EXTRAS = [
  {
    img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80',
    traits: [
      { icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        ), label: 'Asesoría', sub: 'personalizada' },
      { icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><polyline points="8 21 12 17 16 21"/></svg>
        ), label: 'Diseño 3D', sub: 'sin costo' },
      { icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="20 6 9 17 4 12"/></svg>
        ), label: 'Ajustes', sub: 'ilimitados' },
    ],
  },
  {
    img: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=800&q=80',
    traits: [
      { icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        ), label: 'Maderas', sub: 'seleccionadas' },
      { icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/></svg>
        ), label: 'Herrajes y', sub: 'accesorios Premium' },
      { icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        ), label: 'Acabados', sub: 'de alto nivel' },
    ],
  },
  {
    img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80',
    traits: [
      { icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
        ), label: 'Transporte', sub: 'seguro' },
      { icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
        ), label: 'Instalación', sub: 'profesional' },
      { icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        ), label: 'Garantía', sub: 'asegurada' },
    ],
  },
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
          <p className="ml__woods-subtitle">
            Seleccionamos cuidadosamente cada madera por su calidad, belleza y durabilidad
            para garantizar muebles que perduren en el tiempo.
          </p>

          {/* Cards */}
          <div className="ml__wcards">
            {WOODS.map((w, i) => (
              <div className="ml__wcard" key={i}>
                <div className="ml__wcard-imgwrap">
                  <img src={w.img} alt={w.name} className="ml__wcard-img" loading="lazy" />
                  <span className={`ml__wcard-badge ml__wcard-badge--${w.badgeType}`}>{w.badge}</span>
                </div>
                <div className="ml__wcard-body">
                  <div className="ml__wcard-top">
                    <h3 className="ml__wcard-name">{w.name}</h3>
                    <div className="ml__wcard-stars">
                      {[1, 2, 3, 4, 5].map((s) => {
                        let cls = 'ml__star ml__star--empty';
                        if (s <= Math.floor(w.rating)) cls = 'ml__star ml__star--full';
                        else if (s - 0.5 <= w.rating) cls = 'ml__star ml__star--half';
                        return <span key={s} className={cls}>★</span>;
                      })}
                    </div>
                  </div>
                  <p className="ml__wcard-desc">{w.desc}</p>
                  <div className="ml__wcard-traits">
                    {w.traits.map((t, j) => (
                      <div className="ml__wcard-trait" key={j}>
                        <div className="ml__wtrait-icon">{TRAIT_ICONS[t.icon]}</div>
                        <span className="ml__wtrait-label">{t.label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="ml__wcard-ideal">
                    <strong>Ideal para:</strong> {w.ideal}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Barra de garantías */}
          <div className="ml__woods-bar">
            <div className="ml__woods-guarantees">
              <div className="ml__wguarantee">
                <div className="ml__wguarantee-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2C9 2 7 5 7 8c0 4 5 10 5 10s5-6 5-10c0-3-2-6-5-6z"/>
                    <circle cx="12" cy="8" r="2"/>
                  </svg>
                </div>
                <div>
                  <strong>Madera 100% natural</strong>
                  <p>Trabajamos con maderas seleccionadas de fuentes responsables.</p>
                </div>
              </div>
              <div className="ml__wguarantee">
                <div className="ml__wguarantee-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <div>
                  <strong>Calidad garantizada</strong>
                  <p>Cada pieza pasa por un riguroso control para asegurar su máxima durabilidad.</p>
                </div>
              </div>
              <div className="ml__wguarantee">
                <div className="ml__wguarantee-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
                    <path d="M2 21c0-3 1.85-5.36 5.08-6"/>
                  </svg>
                </div>
                <div>
                  <strong>Sostenibilidad</strong>
                  <p>Comprometidos con el medio ambiente y el uso responsable de los recursos.</p>
                </div>
              </div>
              <div className="ml__wguarantee-cta">
                <p className="ml__wguarantee-cta-title">¿No sabes qué madera elegir?</p>
                <p className="ml__wguarantee-cta-sub">Nuestro equipo te asesora</p>
                <a href="/contacto" className="ml__wguarantee-btn">
                  Solicitar asesoría
                  <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <p className="ml__woods-quote">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            Cada veta cuenta una historia. Construyamos la tuya.
          </p>
        </div>
      </section>

      {/* ══════════ SERVICIOS ══════════ */}
      <section className="ml__services">
        <div className="ml__services-inner">
          <div className="ml__section-header">
            <div className="ml__gold-line" />
            <span className="ml__section-label">Lo que fabricamos</span>
          </div>
          <h2 className="ml__section-title">Nuestros Servicios</h2>
          <p className="ml__services-subtitle">
            Acompañamos cada proyecto desde la idea inicial hasta la instalación final,
            garantizando calidad, detalle y satisfacción en cada paso.
          </p>

          <div className="ml__svcards">
            {content.services.map((s, i) => {
              const extra = SERVICE_EXTRAS[i] ?? SERVICE_EXTRAS[0];
              return (
                <div className="ml__svcard" key={s.title ?? i}>
                  <div className="ml__svcard-body">
                    <div className="ml__svcard-icon-wrap">
                      <span className="ml__svcard-icon">{s.icon}</span>
                    </div>
                    <div className="ml__svcard-meta">
                      <span className="ml__svcard-num">0{i + 1}</span>
                      <span className="ml__svcard-tag">Hecho a medida</span>
                    </div>
                    <div className="ml__svcard-num-line" />
                    <h3 className="ml__svcard-title">{s.title}</h3>
                    <p className="ml__svcard-desc">{s.desc}</p>
                    <div className="ml__svcard-bar" />
                    <div className="ml__svcard-traits">
                      {extra.traits.map((t, j) => (
                        <div className="ml__svcard-trait" key={j}>
                          <span className="ml__svtrait-icon">{t.icon}</span>
                          <span className="ml__svtrait-text">
                            {t.label}<br /><em>{t.sub}</em>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer bar */}
          <div className="ml__services-footer">
            <div className="ml__services-footer-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div className="ml__services-footer-copy">
              <p><strong>Calidad garantizada</strong> en cada etapa del proceso</p>
              <span>Diseño, fabricación e instalación con un solo equipo responsable.</span>
            </div>
            <Link to="/contacto" className="ml__services-footer-btn">Quiero cotizar</Link>
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
          <p className="ml__process-subtitle">
            Un proceso simple, transparente y personalizado para que recibas muebles únicos,
            hechos para durar generaciones.
          </p>
          <div className="ml__process-steps">
            {PROCESS.map((step) => (
              <article className="ml__step-card" key={step.num}>
                <div className="ml__step-top">
                  <div className="ml__step-chip">{step.num}</div>
                  <div className="ml__step-line" aria-hidden="true" />
                  <div className="ml__step-icon">{PROCESS_ICONS[step.icon]}</div>
                </div>
                <div className="ml__step-copy">
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
                <div className="ml__step-image-wrap">
                  <img src={step.image} alt={step.title} className="ml__step-image" loading="lazy" />
                </div>
                <div className="ml__step-note">
                  <span className="ml__step-note-icon">{PROCESS_ICONS[step.noteIcon]}</span>
                  <p>{step.note}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="ml__process-assurances">
            {PROCESS_ASSURANCES.map((item) => (
              <div className="ml__process-assurance" key={item.title}>
                <span className="ml__process-assurance-icon">{PROCESS_ICONS[item.icon]}</span>
                <div className="ml__process-assurance-copy">
                  <strong>{item.title}</strong>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="ml__process-cta">
            <p className="ml__process-note">Sin compromiso · Respuesta rápida · Atención personalizada</p>
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
