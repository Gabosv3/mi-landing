import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export const DEFAULT_CONTENT = {
  hero: {
    badge: 'Distribuidora líder en la región',
    title: 'Distribuidora\nBriancesco\nMenjivar',
    subtitle: 'Productos de calidad, entregas confiables. Tu socio comercial de confianza en El Salvador.',
    cta_primary: 'Ver Catálogo',
    cta_secondary: 'Contáctanos',
    image: '/imagenes/Home/Home1.png',
    noteText: 'Todo lo que necesitas\npara tu hogar, en un\nsolo lugar.',
    trust: [
      { icon: 'quality', label: 'Calidad Garantizada' },
      { icon: 'shipping', label: 'Envíos Confiables' },
      { icon: 'support', label: 'Atención Personalizada' },
      { icon: 'price', label: 'Precios Competitivos' },
    ],
  },
  features: [
    { icon: '◆', title: 'Variedad de Productos', desc: 'Amplio catálogo para satisfacer todas tus necesidades comerciales.' },
    { icon: '◇', title: 'Calidad Garantizada', desc: 'Solo trabajamos con proveedores que cumplen los más altos estándares.' },
    { icon: '◈', title: 'Entregas Puntuales', desc: 'Tu pedido llega en el tiempo prometido, siempre y sin excusas.' },
    { icon: '◉', title: 'Precios Competitivos', desc: 'Las mejores tarifas del mercado para maximizar tu margen de ganancia.' },
  ],
  stats: [
    { number: '15+', label: 'Años de Experiencia' },
    { number: '500+', label: 'Clientes Activos' },
    { number: '1,200+', label: 'Productos' },
    { number: '20+', label: 'Ciudades' },
  ],
  about: {
    title: 'Quiénes Somos',
    subtitle: 'Más de 15 años\nimpulsando hogares y negocios',
    lead: 'Somos una empresa salvadoreña dedicada a la distribución de muebles, electrodomésticos y productos para el hogar. Ofrecemos calidad, precios competitivos y un servicio excepcional para clientes comerciales y residenciales en todo El Salvador.',
    text: 'Desde 2009, Distribuidora Briancesco Menjivar se ha consolidado como un aliado estratégico para familias, negocios y emprendedores. Nuestra red de proveedores y nuestra logística nos permiten entregar productos seleccionados con rapidez y seguridad.\n\nNuestro crecimiento se basa en relaciones duraderas, atención personalizada y un compromiso constante con la satisfacción de cada cliente. Supervisamos cada pedido con rigurosidad para garantizar una experiencia de compra transparente y sin sorpresas.\n\nTrabajamos con una visión clara: ser una distribuidora reconocida por su servicio eficiente, su capacidad de respuesta y su apoyo al desarrollo comercial de nuestros socios.',
    mission: 'Brindar soluciones integrales de distribución mediante productos de calidad, atención personalizada y disponibilidad inmediata, generando valor real para nuestros clientes.',
    vision: 'Ser una de las distribuidoras líderes de El Salvador, reconocida por su excelencia en servicio, innovación comercial y compromiso con el crecimiento de nuestros clientes.',
    values: ['Confianza', 'Calidad', 'Puntualidad', 'Atención Personalizada', 'Mejora Continua', 'Compromiso'],
    stats: [
      { number: '+15', label: 'Años de experiencia' },
      { number: '+5,000', label: 'Clientes satisfechos' },
      { number: '+200', label: 'Productos disponibles' },
      { number: '100%', label: 'Compromiso y respaldo' },
    ],
    foundingYear: '2009',
    foundingLabel: 'Año de fundación',
    image: '/imagenes/Home/Home1.png',
    previewText1: 'Distribuidora Briancesco Menjivar nació con la misión de conectar a los mejores proveedores con los negocios que más lo necesitan.',
    previewText2: 'Desde 2009, trabajamos cada día para ofrecer productos de calidad, atención personalizada y soluciones confiables que generan valor y confianza.',
    highlight: 'Nuestra experiencia es tu tranquilidad.',
    badgeYears: '+15 AÑOS',
    badgeLabel: 'DE EXPERIENCIA',
    /* Fotos de la galeria en la pagina completa de Nosotros */
    gallery: [
      { label: 'Bodega y logística', img: '' },
      { label: 'Atención al cliente', img: '' },
      { label: 'Productos para el hogar', img: '' },
      { label: 'Amplio inventario', img: '' },
    ],
  },
  cta: {
    title: '¿Listo para hacer tu pedido?',
    text: 'Contáctanos hoy y recibe atención personalizada de nuestro equipo.',
    cta_primary: 'Solicitar Cotización',
    cta_secondary: 'Ver Catálogo',
  },
  contact: {
    phone: '+503 0000-0000',
    email: 'info@distribuidoradbm.com',
    address: 'San Salvador, El Salvador',
    hours: 'Lun – Vie: 8:00 AM – 5:00 PM',
  },
  muebles: {
    title: 'Muebles a la Medida',
    subtitle: 'Creamos espacios únicos adaptados a tu estilo y necesidades.',
    description: 'Cada mueble que fabricamos nace de un proceso de diseño personalizado junto al cliente. Trabajamos con materiales de primera calidad para garantizar durabilidad, estética y funcionalidad en cada pieza.\n\nDesde salas hasta cocinas integrales, dormitorios y oficinas — transformamos tus ideas en realidad.',
    cta_text: 'Solicitar Cotización',
    heroBg: '',
    gallery: [
      { url: '', caption: 'Sala Personalizada' },
      { url: '', caption: 'Dormitorio a Medida' },
      { url: '', caption: 'Cocina Integral' },
    ],
    services: [
      { icon: '◆', title: 'Diseño a tu Gusto', desc: 'Trabajamos junto a ti desde el boceto hasta el producto final.' },
      { icon: '◇', title: 'Materiales Premium', desc: 'Solo utilizamos maderas y materiales de alta calidad.' },
      { icon: '◈', title: 'Entrega e Instalación', desc: 'Nos encargamos del traslado y montaje en tu hogar.' },
    ],
    /* Imagen de cada tipo de madera (seccion "Trabajamos con las mejores maderas").
       Vacio = usa la foto de stock por defecto. */
    woods: [
      { name: 'Cedro', img: '' },
      { name: 'Caoba', img: '' },
      { name: 'Roble', img: '' },
      { name: 'Pino', img: '' },
    ],
    /* Imagen de cada paso de la seccion "Del boceto a tu hogar". */
    process: [
      { name: 'Consulta Inicial', img: '' },
      { name: 'Diseño Personalizado', img: '' },
      { name: 'Fabricación Artesanal', img: '' },
      { name: 'Entrega e Instalación', img: '' },
    ],
  },
};

export function useContent(section) {
  const [content, setContent] = useState(DEFAULT_CONTENT[section]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const docRef = doc(db, 'content', section);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          // features y stats son arrays almacenados bajo el campo "items"
          if (Array.isArray(DEFAULT_CONTENT[section])) {
            setContent(data.items ?? DEFAULT_CONTENT[section]);
          } else {
            setContent({ ...DEFAULT_CONTENT[section], ...data });
          }
        }
      } catch {
        // Firebase no configurado aún → usar contenido por defecto
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [section]);

  return { content, loading };
}
