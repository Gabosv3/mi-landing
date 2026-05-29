import { useState, useEffect } from 'react';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../firebase/config';

const PLACEHOLDER = [
  { id: 1, name: 'Producto Ejemplo A', category: 'Categoría 1', desc: 'Descripción breve del producto disponible en nuestro catálogo.', price: 'Consultar' },
  { id: 2, name: 'Producto Ejemplo B', category: 'Categoría 2', desc: 'Descripción breve del producto disponible en nuestro catálogo.', price: 'Consultar' },
  { id: 3, name: 'Producto Ejemplo C', category: 'Categoría 1', desc: 'Descripción breve del producto disponible en nuestro catálogo.', price: 'Consultar' },
  { id: 4, name: 'Producto Ejemplo D', category: 'Categoría 3', desc: 'Descripción breve del producto disponible en nuestro catálogo.', price: 'Consultar' },
  { id: 5, name: 'Producto Ejemplo E', category: 'Categoría 2', desc: 'Descripción breve del producto disponible en nuestro catálogo.', price: 'Consultar' },
  { id: 6, name: 'Producto Ejemplo F', category: 'Categoría 3', desc: 'Descripción breve del producto disponible en nuestro catálogo.', price: 'Consultar' },
];

export default function Products() {
  const [products, setProducts] = useState(PLACEHOLDER);
  const [filter, setFilter] = useState('Todos');

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'products'), limit(12)));
        if (!snap.empty) {
          setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        }
      } catch {
        // usar placeholder si Firebase no está configurado
      }
    };
    fetch();
  }, []);

  const categories = ['Todos', ...new Set(products.map((p) => p.category))];
  const visible = filter === 'Todos' ? products : products.filter((p) => p.category === filter);

  return (
    <section className="products" id="productos">
      <div className="products__inner">
        <div className="section-header">
          <span className="section-label">Nuestro Catálogo</span>
          <h2>Productos Destacados</h2>
        </div>

        <div className="products__filters">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-btn${filter === cat ? ' filter-btn--active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="products__grid">
          {visible.map((p) => (
            <article className="product-card" key={p.id}>
              <div className="product-card__img">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} loading="lazy" />
                ) : (
                  <div className="product-card__placeholder" aria-hidden="true">◈</div>
                )}
                <span className="product-card__tag">{p.category}</span>
              </div>
              <div className="product-card__body">
                <h3>{p.name}</h3>
                <p>{p.desc || p.description}</p>
                <div className="product-card__footer">
                  <span className="product-card__price">{p.price}</span>
                  <a href="#contacto" className="btn btn--outline btn--sm">Cotizar</a>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="products__cta">
          <a href="#contacto" className="btn btn--solid">Solicitar Catálogo Completo</a>
        </div>
      </div>
    </section>
  );
}
