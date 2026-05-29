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
    text: 'Distribuidora Briancesco Menjivar nació con la misión de conectar a los mejores proveedores con los negocios que más lo necesitan. Con más de 15 años en el mercado, hemos construido una red de confianza basada en la calidad, la puntualidad y el servicio personalizado.\n\nCreemos que el éxito de nuestros clientes es nuestro éxito. Por eso, ofrecemos soluciones de distribución adaptadas a cada necesidad, con atención personalizada y seguimiento constante.',
    values: ['Confianza', 'Calidad', 'Puntualidad', 'Servicio'],
    foundingYear: '2009',
    foundingLabel: 'Año de fundación',
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
