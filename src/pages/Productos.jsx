import { useState, useEffect } from "react";
import { Link }                from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db }                  from "../firebase/config";

const PLACEHOLDER = [
  { id: "p1", name: "Producto Ejemplo A", category: "Limpieza del Hogar",    description: "Descripcion breve del producto disponible en nuestro catalogo.", price: "Consultar" },
  { id: "p2", name: "Producto Ejemplo B", category: "Cocina y Comedor",      description: "Descripcion breve del producto disponible en nuestro catalogo.", price: "Consultar" },
  { id: "p3", name: "Producto Ejemplo C", category: "Limpieza del Hogar",    description: "Descripcion breve del producto disponible en nuestro catalogo.", price: "Consultar" },
  { id: "p4", name: "Producto Ejemplo D", category: "Dormitorio",            description: "Descripcion breve del producto disponible en nuestro catalogo.", price: "Consultar" },
  { id: "p5", name: "Producto Ejemplo E", category: "Cocina y Comedor",      description: "Descripcion breve del producto disponible en nuestro catalogo.", price: "Consultar" },
  { id: "p6", name: "Producto Ejemplo F", category: "Dormitorio",            description: "Descripcion breve del producto disponible en nuestro catalogo.", price: "Consultar" },
];

export default function Productos() {
  const [products, setProducts] = useState(PLACEHOLDER);
  const [filter,   setFilter]   = useState("Todos");
  const [search,   setSearch]   = useState("");
  const [loaded,   setLoaded]   = useState(false);

  useEffect(() => {
    getDocs(collection(db, "products"))
      .then((snap) => {
        if (!snap.empty) setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const categories = ["Todos", ...new Set(products.map((p) => p.category).filter(Boolean))];

  const counts = { Todos: products.length };
  products.forEach((p) => { if (p.category) counts[p.category] = (counts[p.category] || 0) + 1; });

  const visible = products.filter((p) => {
    const matchCat  = filter === "Todos" || p.category === filter;
    const q         = search.toLowerCase();
    const matchText = !q ||
      (p.name        || "").toLowerCase().includes(q) ||
      (p.description || p.desc || "").toLowerCase().includes(q) ||
      (p.category    || "").toLowerCase().includes(q);
    return matchCat && matchText;
  });

  return (
    <section className="products products--page">
      <div className="products__inner">

        {/* Encabezado */}
        <div className="products__page-header">
          <div className="section-header">
            <span className="section-label">Catalogo completo</span>
            <h1>Nuestros Productos</h1>
          </div>
          <div className="products__search-wrap">
            <span className="products__search-icon">⌕</span>
            <input
              type="search"
              className="products__search"
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Filtros de categoria */}
        <div className="products__filters">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-btn${filter === cat ? " filter-btn--active" : ""}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
              <span className="filter-btn__count">{counts[cat] || 0}</span>
            </button>
          ))}
        </div>

        {/* Resultados */}
        {visible.length === 0 ? (
          <div className="products__empty">
            <span>◈</span>
            <p>No se encontraron productos{search ? ` para "${search}"` : " en esta categoria"}.</p>
            <button className="btn btn--outline" onClick={() => { setFilter("Todos"); setSearch(""); }}>
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="products__grid">
            {visible.map((p) => (
              <Link to={`/productos/${p.id}`} className="product-card" key={p.id}>
                <div className="product-card__img">
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} loading="lazy" />
                    : <div className="product-card__placeholder" aria-hidden="true">◈</div>}
                  <span className="product-card__tag">{p.category}</span>
                </div>
                <div className="product-card__body">
                  <h3>{p.name}</h3>
                  <p>{p.description || p.desc}</p>
                  <div className="product-card__footer">
                    <span className="product-card__price">{p.price}</span>
                    <span className="product-card__ver">Ver detalle →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* CTA */}
        {visible.length > 0 && (
          <div className="products__cta">
            <Link to="/contacto" className="btn btn--solid">Solicitar Cotizacion</Link>
          </div>
        )}
      </div>
    </section>
  );
}
