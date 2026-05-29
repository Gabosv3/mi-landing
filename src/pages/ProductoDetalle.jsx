import { useState, useEffect } from 'react';
import { useParams, Link }    from 'react-router-dom';
import { doc, getDoc }        from 'firebase/firestore';
import { db }                 from '../firebase/config';

export default function ProductoDetalle() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoc(doc(db, 'products', id))
      .then((snap) => { if (snap.exists()) setProduct({ id: snap.id, ...snap.data() }); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="pd-state">
        <div className="pd-state__spinner" aria-label="Cargando…" />
        <p>Cargando producto…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pd-state pd-state--empty">
        <span className="pd-state__icon">◈</span>
        <h2>Producto no encontrado</h2>
        <p>Es posible que haya sido eliminado o la URL sea incorrecta.</p>
        <Link to="/productos" className="btn btn--solid">← Volver al catálogo</Link>
      </div>
    );
  }

  return (
    <div className="pd">
      {/* Breadcrumb */}
      <div className="pd__breadcrumb">
        <div className="pd__bc-inner">
          <Link to="/">Inicio</Link>
          <span className="pd__bc-sep">/</span>
          <Link to="/productos">Productos</Link>
          <span className="pd__bc-sep">/</span>
          <span className="pd__bc-current">{product.name}</span>
        </div>
      </div>

      {/* Main layout */}
      <div className="pd__inner">

        {/* Imagen */}
        <div className="pd__media">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="pd__img" />
          ) : (
            <div className="pd__img-placeholder">
              <span>◈</span>
              <small>Sin imagen</small>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="pd__info">
          <span className="pd__category-badge">{product.category}</span>
          <h1 className="pd__name">{product.name}</h1>

          <div className="pd__price-row">
            <span className="pd__price-label">Precio</span>
            <span className="pd__price">{product.price}</span>
          </div>

          {(product.description || product.desc) && (
            <div className="pd__desc-block">
              <h3 className="pd__desc-title">Descripción</h3>
              <p className="pd__desc">{product.description || product.desc}</p>
            </div>
          )}

          <div className="pd__divider" />

          <div className="pd__meta">
            <div className="pd__meta-item">
              <span className="pd__meta-label">Categoría</span>
              <span className="pd__meta-val">{product.category}</span>
            </div>
            <div className="pd__meta-item">
              <span className="pd__meta-label">Disponibilidad</span>
              <span className="pd__meta-val pd__meta-val--ok">● En stock</span>
            </div>
          </div>

          <div className="pd__actions">
            <Link to={`/contacto?producto=${encodeURIComponent(product.name)}`} className="btn btn--solid btn--lg">
              Solicitar Cotización
            </Link>
            <Link to="/productos" className="btn btn--outline">
              ← Catálogo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
