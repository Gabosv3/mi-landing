import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useCart } from "../context/CartContext";
import PriceTag from "../components/PriceTag";
import FilterSelect from "../components/FilterSelect";

export default function Productos() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  
  // States para los filtros
  const [catFilter,   setCatFilter]   = useState("Todas las categorías");
  const [subFilter,   setSubFilter]   = useState("Todas las subcategorías");
  const [priceFilter, setPriceFilter] = useState("Todos los precios");
  const [brandFilter, setBrandFilter] = useState("Todas las marcas");
  const [availFilter, setAvailFilter] = useState("Todos");
  
  const [search, setSearch] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [sortBy, setSortBy] = useState("Más recientes");

  useEffect(() => {
    getDocs(collection(db, "products"))
      .then((snap) => {
        if (!snap.empty) {
          const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          // Ensure category names are uppercase to match mockup conventions
          fetched.forEach(f => f.category = (f.category || "General").toUpperCase());
          setProducts(fetched);
        } else {
          setProducts([]); // replace placeholder if no products in DB
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  // Extraer valores únicos para los dropdowns y pills
  const categories = ["Todas las categorías", ...new Set(products.map((p) => p.category).filter(Boolean))];
  const subcategories = ["Todas las subcategorías", ...new Set(products.map((p) => p.subcategory).filter(Boolean))];
  const brands = ["Todas las marcas", ...new Set(products.map((p) => p.brand).filter(Boolean))];
  const availabilities = ["Todos", "Disponible", "Agotado", "Bajo pedido"];

  const counts = { "Todas las categorías": products.length };
  products.forEach((p) => { if (p.category) counts[p.category] = (counts[p.category] || 0) + 1; });

  const clearFilters = () => {
    setCatFilter("Todas las categorías");
    setSubFilter("Todas las subcategorías");
    setPriceFilter("Todos los precios");
    setBrandFilter("Todas las marcas");
    setAvailFilter("Todos");
    setSearch("");
    setCurrentPage(1);
  };

  // Filtrado final
  let visible = products.filter((p) => {
    // Texto
    const q = search.toLowerCase();
    const matchText = !q ||
      (p.name || "").toLowerCase().includes(q) ||
      (p.description || p.desc || "").toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q) ||
      (p.brand || "").toLowerCase().includes(q) ||
      (p.subcategory || "").toLowerCase().includes(q);

    // Categoria
    const matchCat = catFilter === "Todas las categorías" || p.category === catFilter;
    
    // Subcategoria
    const matchSub = subFilter === "Todas las subcategorías" || p.subcategory === subFilter;

    // Marca
    const matchBrand = brandFilter === "Todas las marcas" || p.brand === brandFilter;

    // Disponibilidad
    const matchAvail = availFilter === "Todos" || p.availability === availFilter;

    // Rango de precio
    let matchPrice = true;
    if (priceFilter !== "Todos los precios") {
      const priceNum = parseFloat(p.price?.replace(/[^0-9.]/g, '')) || 0;
      if (priceFilter === "Menos de $50") matchPrice = priceNum > 0 && priceNum < 50;
      else if (priceFilter === "$50 - $100") matchPrice = priceNum >= 50 && priceNum <= 100;
      else if (priceFilter === "Más de $100") matchPrice = priceNum > 100;
    }

    return matchText && matchCat && matchSub && matchBrand && matchAvail && matchPrice;
  });

  // Ordenamiento
  visible.sort((a, b) => {
    if (sortBy === "Más recientes") {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return timeB - timeA;
    } else if (sortBy === "Precio: Menor a Mayor") {
      const pA = parseFloat(a.price?.replace(/[^0-9.]/g, '')) || 0;
      const pB = parseFloat(b.price?.replace(/[^0-9.]/g, '')) || 0;
      return pA - pB;
    } else if (sortBy === "Precio: Mayor a Menor") {
      const pA = parseFloat(a.price?.replace(/[^0-9.]/g, '')) || 0;
      const pB = parseFloat(b.price?.replace(/[^0-9.]/g, '')) || 0;
      return pB - pA;
    }
    return 0;
  });

  const totalPages = Math.ceil(visible.length / itemsPerPage) || 1;
  const currentItems = visible.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <section className="prod2026">
      <div className="home2026__shell">
        
        {/* Header Section */}
        <div className="prod2026__header">
          <div className="prod2026__header-text">
            <div className="home2026__eyebrow-wrap">
              <span className="home2026__eyebrow" style={{textTransform: 'uppercase', letterSpacing: '0.05em'}}>Catálogo Completo</span>
            </div>
            <h1 className="prod2026__title">Nuestros Productos</h1>
            <p className="prod2026__subtitle">Explora nuestro catálogo completo. Encuentra productos de calidad para el hogar y tu negocio.</p>
          </div>
          
          <div className="prod2026__search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Buscar producto..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>

        {!loaded ? (
          <div className="products__empty" style={{padding: '80px 0'}}>
            <p>Cargando productos…</p>
          </div>
        ) : (
        <>
        {/* Filter Bar (Visual) */}
        <div className="prod2026__filterbar">
          <div className="prod2026__filter-group">
            <div className="prod2026__filter-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              <div className="prod2026__filter-info">
                <span>CATEGORÍA</span>
                <FilterSelect value={catFilter} onChange={(v) => { setCatFilter(v); setCurrentPage(1); }} options={categories} />
              </div>
            </div>
            <div className="prod2026__filter-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
              <div className="prod2026__filter-info">
                <span>SUBCATEGORÍA</span>
                <FilterSelect value={subFilter} onChange={(v) => { setSubFilter(v); setCurrentPage(1); }} options={subcategories} />
              </div>
            </div>
            <div className="prod2026__filter-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8"></path><path d="M8 10h8"></path><path d="M8 14h8"></path></svg>
              <div className="prod2026__filter-info">
                <span>RANGO DE PRECIO</span>
                <FilterSelect
                  value={priceFilter}
                  onChange={(v) => { setPriceFilter(v); setCurrentPage(1); }}
                  options={["Todos los precios", "Menos de $50", "$50 - $100", "Más de $100"]}
                />
              </div>
            </div>
            <div className="prod2026__filter-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
              <div className="prod2026__filter-info">
                <span>MARCA</span>
                <FilterSelect value={brandFilter} onChange={(v) => { setBrandFilter(v); setCurrentPage(1); }} options={brands} />
              </div>
            </div>
            <div className="prod2026__filter-item" style={{borderRight: 'none'}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              <div className="prod2026__filter-info">
                <span>DISPONIBILIDAD</span>
                <FilterSelect value={availFilter} onChange={(v) => { setAvailFilter(v); setCurrentPage(1); }} options={availabilities} />
              </div>
            </div>
          </div>
          <div className="prod2026__filter-actions">
            <button className="prod2026__btn-black">FILTRAR <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg></button>
            <button className="prod2026__btn-clear" onClick={clearFilters}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg> LIMPIAR</button>
          </div>
        </div>

        {/* Category Pills & Sort */}
        <div className="prod2026__controls">
          <div className="prod2026__pills">
            {categories.slice(0, 6).map((cat) => (
              <button
                key={cat}
                className={`prod2026__pill ${catFilter === cat ? "prod2026__pill--active" : ""}`}
                onClick={() => { setCatFilter(cat); setCurrentPage(1); }}
              >
                {cat === "Todas las categorías" ? "TODOS" : cat}
                <span className="prod2026__pill-count">{counts[cat] || counts["Todas las categorías"]}</span>
              </button>
            ))}
          </div>
          <div className="prod2026__sort">
            <span>Ordenar por:</span>
            <FilterSelect
              value={sortBy}
              onChange={setSortBy}
              options={["Más recientes", "Precio: Menor a Mayor", "Precio: Mayor a Menor"]}
            />
          </div>
        </div>

        {/* Product Grid */}
        {visible.length === 0 ? (
          <div className="products__empty" style={{padding: '80px 0'}}>
            <span style={{fontSize: '3rem', color: '#ccc'}}>?</span>
            <p style={{marginTop: '16px'}}>No se encontraron productos{search ? ` para "${search}"` : " en esta categoria"}.</p>
            <button className="prod2026__btn-black" style={{marginTop: '24px'}} onClick={() => { setFilter("TODOS"); setSearch(""); }}>Limpiar filtros</button>
          </div>
        ) : (
          <div className="home2026__pgrid">
            {currentItems.map((p) => (
              <article className="home2026__pcard prod2026__pcard-alt" key={p.id}>
                <div className="home2026__pcard-imgwrap">
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} loading="lazy" />
                    : <div className="home2026__pcard-ph" aria-hidden="true">?</div>}
                  <span className="home2026__pcard-tag" style={{backgroundColor: '#111', fontWeight: 600, letterSpacing: '0.02em'}}>{p.category}</span>
                </div>
                <div className="home2026__pcard-body">
                  <h3 style={{fontSize: '1.05rem'}}>{p.name}</h3>
                  <PriceTag price={p.price} compareAtPrice={p.compareAtPrice} className="prod2026__card-price" />
                  <div className="prod2026__card-actions" style={{marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px'}}>
                    <Link to={`/productos/${p.id}`} className="prod2026__link-detail">Ver detalle &rarr;</Link>
                    <button onClick={() => addToCart({ id: p.id, name: p.name, price: p.price || "Contactar", image: p.image_url || p.image_url })} className="home2026__pbtn home2026__pbtn--gold" style={{padding: "8px 16px", borderRadius: "4px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", fontWeight: 600}}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                           <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                           <line x1="3" y1="6" x2="21" y2="6"></line>
                           <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                        Agregar
                      </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {visible.length > 0 && (
          <div className="prod2026__pagination-bar">
            <div className="prod2026__pag-info">
              Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, visible.length)} de {visible.length} productos
            </div>
            
            <div className="prod2026__pag-controls">
              <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>&lsaquo;</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button 
                  key={i + 1} 
                  className={currentPage === i + 1 ? "active" : ""}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>&rsaquo;</button>
            </div>

            <div className="prod2026__pag-size">
              <span>Productos por página:</span>
              <FilterSelect
                value={itemsPerPage}
                onChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1); }}
                options={[8, 12, 24]}
              />
            </div>
          </div>
        )}
        </>
        )}

      </div>
    </section>
  );
}



