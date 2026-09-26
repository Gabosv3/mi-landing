import { useState, useEffect, useMemo } from 'react';
import { useParams, Link }    from 'react-router-dom';
import { doc, getDoc }        from 'firebase/firestore';
import { db }                 from '../firebase/config';
import { useCart }            from '../context/CartContext';
import PriceTag                from '../components/PriceTag';

export default function ProductoDetalle() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [zoomPos, setZoomPos] = useState(null);
  const { addToCart } = useCart();

  const handleZoomMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  useEffect(() => {
    getDoc(doc(db, 'products', id))
      .then((snap) => {
        if (snap.exists()) setProduct({ id: snap.id, ...snap.data() });
        setActiveIndex(0);
        setSelectedColor(null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const images = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length > 0) return product.images;
    return product.image_url ? [{ url: product.image_url }] : [];
  }, [product]);

  const colors = useMemo(
    () => (Array.isArray(product?.colors) ? product.colors.filter((c) => c.name) : []),
    [product]
  );

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

  const activeImage = images[activeIndex] || images[0];

  const selectColor = (color) => {
    setSelectedColor(color.name);
    const idx = images.findIndex((img) => img.url === color.imageUrl);
    if (idx >= 0) setActiveIndex(idx);
  };

  const description = product.description || product.desc;

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
          {activeImage ? (
            <div
              className="pd__img-zoom-wrap"
              onMouseMove={handleZoomMove}
              onMouseLeave={() => setZoomPos(null)}
            >
              <img src={activeImage.url} alt={product.name} className="pd__img" />
              {zoomPos && (
                <div
                  className="pd__img-zoom-lens"
                  style={{
                    backgroundImage: `url(${activeImage.url})`,
                    backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                  }}
                />
              )}
            </div>
          ) : (
            <div className="pd__img-placeholder">
              <span>◈</span>
              <small>Sin imagen</small>
            </div>
          )}

          {images.length > 1 && (
            <div className="pd__thumbs">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  className={`pd__thumb${i === activeIndex ? ' pd__thumb--active' : ''}`}
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Ver imagen ${i + 1}`}
                >
                  <img src={img.url} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="pd__info">
          <span className="pd__category-badge">{product.category}</span>
          <h1 className="pd__name">{product.name}</h1>

          <div className="pd__price-row">
            <span className="pd__price-label">Precio</span>
            <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} className="pd__price" />
          </div>

          {description && (
            <div className="pd__desc-block">
              <h3 className="pd__desc-title">Descripción</h3>
              <div className="pd__desc" dangerouslySetInnerHTML={{ __html: description }} />
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

          {colors.length > 0 && (
            <div className="pd__color-row">
              <span className="pd__meta-label">Color{selectedColor ? `: ${selectedColor}` : ''}</span>
              <div className="pd__color-swatches">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    className={`pd__swatch${selectedColor === color.name ? ' pd__swatch--active' : ''}`}
                    style={{ backgroundColor: color.hex }}
                    onClick={() => selectColor(color)}
                    title={color.name}
                    aria-label={color.name}
                  >
                    {selectedColor === color.name && <span className="pd__swatch-check">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pd__qty-row">
            <span className="pd__meta-label">Cantidad</span>
            <div className="pd__qty-control">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Disminuir cantidad">-</button>
              <span>{qty}</span>
              <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="Aumentar cantidad">+</button>
            </div>
          </div>

          <div className="pd__actions">
            <button
              type="button"
              className="btn btn--solid btn--lg"
              onClick={() => {
                addToCart({
                  id: product.id + (selectedColor ? `-${selectedColor}` : ''),
                  name: product.name + (selectedColor ? ` (${selectedColor})` : ''),
                  price: product.price || 'Contactar',
                  image: activeImage?.url || product.image_url,
                }, qty);
                setAdded(true);
                setTimeout(() => setAdded(false), 2500);
              }}
            >
              {added ? '✓ Agregado' : 'Agregar al carrito'}
            </button>
            <Link to={`/contacto?producto=${encodeURIComponent(product.name)}`} className="btn btn--outline">
              Solicitar Cotización
            </Link>
          </div>
          <Link to="/productos" className="pd__back-link">
            ← Volver al catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}
