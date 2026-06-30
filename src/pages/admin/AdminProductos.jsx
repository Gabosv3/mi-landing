import { useState, useEffect, useRef } from "react";
import {
  collection, getDocs, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp, orderBy, query as fsQuery,
} from "firebase/firestore";
import { db } from "../../firebase/config";

/* Genera un id unico local para manejar el array de imagenes en estado */
let _uid = 0;
const uid = () => `img_${Date.now()}_${_uid++}`;

function buildImageItem(url, path, isPrimary, file) {
  return { id: uid(), url, storagePath: path, isPrimary: !!isPrimary, file: file || null, uploading: false, progress: 0 };
}

const EMPTY_FORM = { name: "", category: "", subcategory: "", customCategory: "", description: "", price: "", brand: "", availability: "Disponible" };

export default function AdminProductos() {
  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [catColors,   setCatColors]   = useState({});
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [images,      setImages]      = useState([]);         // array de image items
  const [editingId,   setEditingId]   = useState(null);
  const [showForm,    setShowForm]    = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [search,      setSearch]      = useState("");
  const fileInputRef = useRef(null);

  /* -- Cargar datos -- */
  const loadProducts = async () => {
    try {
      const snap = await getDocs(collection(db, "products"));
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch {}
  };

  const loadCategories = async () => {
    try {
      const snap = await getDocs(fsQuery(collection(db, "categories"), orderBy("name")));
      const cats = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCategories(cats);
      const colorMap = {};
      cats.forEach((c) => { colorMap[c.name] = c.color || "#6366f1"; });
      setCatColors(colorMap);
    } catch {}
  };

  useEffect(() => { loadProducts(); loadCategories(); }, []);

  const getCatColor = (cat) => catColors[cat] || "#6366f1";

  /* -- Abrir formulario -- */
  const openNew = () => {
    setForm(EMPTY_FORM);
    setImages([]);
    setEditingId(null);
    setShowForm(true);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
  };

  const openEdit = (p) => {
    setForm({
      name:           p.name || "",
      category:       p.category || "",
      subcategory:    p.subcategory || "",
      customCategory: "",
      description:    p.description || p.desc || "",
      price:          p.price || "",
      brand:          p.brand || "",
      availability:   p.availability || "Disponible",
    });
    /* Cargar imagenes existentes */
    const imgs = Array.isArray(p.images) && p.images.length > 0
      ? p.images.map((img) => buildImageItem(img.url, img.path || "", img.isPrimary, null))
      : p.image_url
        ? [buildImageItem(p.image_url, "", true, null)]
        : [];
    /* Garantizar que al menos una sea principal */
    if (imgs.length > 0 && !imgs.some((i) => i.isPrimary)) imgs[0].isPrimary = true;
    setImages(imgs);
    setEditingId(p.id);
    setShowForm(true);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
  };

  /* -- Manejo de imagenes -- */
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setImages((prev) => {
      const hasPrimary = prev.some((i) => i.isPrimary);
      return [
        ...prev,
        ...files.map((file, idx) =>
          buildImageItem(URL.createObjectURL(file), "", !hasPrimary && idx === 0, file)
        ),
      ];
    });
    e.target.value = "";
  };

  const setPrimary = (id) =>
    setImages((prev) => prev.map((img) => ({ ...img, isPrimary: img.id === id })));

  const removeImage = (id) =>
    setImages((prev) => {
      const next = prev.filter((img) => img.id !== id);
      if (next.length > 0 && !next.some((img) => img.isPrimary)) next[0].isPrimary = true;
      return next;
    });

  /* -- Subir imagen localmente (igual que en Contenido) -- */
  const uploadImage = async (item, productId) => {
    const dataUrl = await new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = (e) => res(e.target.result);
      reader.onerror = rej;
      reader.readAsDataURL(item.file);
    });
    
    setImages((prev) => prev.map((i) => i.id === item.id ? { ...i, uploading: true, progress: 50 } : i));
    
    const resp = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: dataUrl, name: `${productId}_${item.file.name}` }),
    });
    
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.error);
    
    setImages((prev) => prev.map((i) => i.id === item.id ? { ...i, uploading: false, progress: 100, url: json.url, storagePath: "", file: null } : i));
    return { url: json.url, path: "" };
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) return alert("Faltan campos (Nombre, Precio, Categoria)");
    setSaving(true);
    try {
      const productId = editingId || `prod_${Date.now()}`;
      const finalCategory = form.category === "custom" ? form.customCategory.trim() : form.category;

      /* Subir solo las imagenes nuevas (que tienen file) */
      const finalImages = await Promise.all(
        images.map(async (img) => {
          if (img.file) {
            const { url, path } = await uploadImage(img, productId);
            return { url, path, isPrimary: img.isPrimary };
          }
          return { url: img.url, path: img.storagePath || "", isPrimary: img.isPrimary };
        })
      );

      const primaryImg = finalImages.find((i) => i.isPrimary) || finalImages[0];

      const data = {
        name:        form.name.trim(),
        category:    finalCategory,
        subcategory: form.subcategory.trim(),
        description: form.description.trim(),
        price:       form.price.trim(),
        brand:       form.brand.trim(),
        availability:form.availability,
        images:      finalImages,
        image_url:   primaryImg?.url || "",   /* compatibilidad con vista publica */
        updatedAt:   serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, "products", editingId), data);
      } else {
        await addDoc(collection(db, "products"), { ...data, createdAt: serverTimestamp() });
      }

      await loadProducts();
      setShowForm(false);
      setImages([]);
    } catch (err) {
      alert("Error al guardar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Eliminar este producto?")) return;
    await deleteDoc(doc(db, "products", id));
    await loadProducts();
  };

  const filtered = products.filter(
    (p) =>
      !search ||
      (p.name     || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(search.toLowerCase())
  );

  const primaryImg = images.find((i) => i.isPrimary) || images[0];

  /* -- Render -- */
  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>Productos</h1>
        <button className="admin-btn" onClick={openNew}>+ Nuevo Producto</button>
      </div>

      {/* ---------------- FORMULARIO ---------------- */}
      {showForm && (
        <form className="admin-editor adp-form" onSubmit={handleSave}>
          <h2 className="admin-editor__title">
            {editingId ? "Editar Producto" : "Nuevo Producto"}
          </h2>

          <div className="adp-form__grid">

            {/* Nombre */}
            <div className="admin-form-group adp-form__full">
              <label>Nombre del producto *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
                placeholder="Ej: Desengrasante Industrial 1L"
              />
            </div>

            {/* Categoria */}
            <div className="admin-form-group">
              <label>Categoria *</label>
              <select
                name="category"
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                required
                className="adp-select"
              >
                <option value="">-- Seleccionar --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.icon} {c.name}</option>
                ))}
                <option value="custom">+ Otra categoría</option>
              </select>
            </div>

            {form.category === "custom" && (
              <div className="admin-form-group">
                <label>Nombre de la categoria *</label>
                <input
                  type="text"
                  name="customCategory"
                  value={form.customCategory}
                  onChange={(e) => setForm((p) => ({ ...p, customCategory: e.target.value }))}
                  required
                  placeholder="Ej: Herramientas"
                />
              </div>
            )}

            {/* Subcategoria */}
            <div className="admin-form-group">
              <label>Subcategoría</label>
              <input
                type="text"
                name="subcategory"
                value={form.subcategory}
                onChange={(e) => setForm((p) => ({ ...p, subcategory: e.target.value }))}
                placeholder="Ej: Cocinas, Sillas, Sartenes..."
              />
            </div>

            {/* Precio */}
            <div className="admin-form-group">
              <label>Precio *</label>
              <input
                type="text"
                name="price"
                value={form.price}
                onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                required
                placeholder="Ej: $12.50 o Consultar"
              />
            </div>

            {/* Marca */}
            <div className="admin-form-group">
              <label>Marca</label>
              <input
                type="text"
                name="brand"
                value={form.brand}
                onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))}
                placeholder="Ej: Oster, Mabe..."
              />
            </div>

            {/* Disponibilidad */}
            <div className="admin-form-group">
              <label>Disponibilidad</label>
              <select
                name="availability"
                value={form.availability}
                onChange={(e) => setForm((p) => ({ ...p, availability: e.target.value }))}
                className="adp-select"
              >
                <option value="Disponible">Disponible</option>
                <option value="Agotado">Agotado</option>
                <option value="Bajo pedido">Bajo pedido</option>
              </select>
            </div>

            {/* Descripcion */}
            <div className="admin-form-group adp-form__full">
              <label>Descripcion</label>
              <textarea
                name="description"
                rows={4}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Describe el producto, usos, presentaciones disponibles."
              />
            </div>

          </div>

          {/* ---- IMAGENES ---- */}
          <div className="adp-images-section">
            <div className="adp-images-header">
              <span className="adp-images-title">Imagenes del producto</span>
              <span className="adp-images-hint">La imagen principal se muestra en el catalogo</span>
            </div>

            {images.length > 0 && (
              <div className="adp-images-grid">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className={`adp-img-item${img.isPrimary ? " adp-img-item--primary" : ""}`}
                  >
                    <div className="adp-img-item__thumb">
                      <img src={img.url} alt="" />
                      {img.uploading && (
                        <div className="adp-img-item__progress">
                          <div className="adp-img-item__bar" style={{ width: `${img.progress}%` }} />
                          <span>{img.progress}%</span>
                        </div>
                      )}
                    </div>
                    {img.isPrimary && <span className="adp-img-item__badge">? Principal</span>}
                    <div className="adp-img-item__actions">
                      {!img.isPrimary && (
                        <button type="button" className="adp-img-btn adp-img-btn--star" onClick={() => setPrimary(img.id)} title="Hacer principal">
                          ?
                        </button>
                      )}
                      <button type="button" className="adp-img-btn adp-img-btn--del" onClick={() => removeImage(img.id)} title="Eliminar">
                        ?
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={handleFileSelect}
            />
            <button
              type="button"
              className="adp-add-images-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <span>+</span> Agregar imágenes
            </button>
            {images.length === 0 && (
              <p className="adp-images-empty">Sin imágenes. La primera que agregues sera la principal.</p>
            )}
          </div>

          <div className="admin-editor__actions">
            <button type="submit" className="admin-btn" disabled={saving}>
              {saving ? "Subiendo y guardando..." : editingId ? "Guardar cambios" : "Crear producto"}
            </button>
            <button type="button" className="admin-btn admin-btn--ghost" onClick={() => { setShowForm(false); setImages([]); }}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* ---------------- BUSQUEDA ---------------- */}
      <div className="adp-search-row">
        <input
          type="search"
          className="adp-search"
          placeholder="Buscar por nombre o categoría"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="adp-count">{filtered.length} producto{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* ---------------- TABLA ---------------- */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Imagenes</th>
              <th>Categoria</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="admin-table__empty">
                  {search ? "Sin resultados." : "No hay productos. Agrega el primero."}
                </td>
              </tr>
            ) : (
              filtered.map((p) => {
                const mainImg = Array.isArray(p.images) && p.images.length > 0
                  ? (p.images.find((i) => i.isPrimary) || p.images[0])
                  : null;
                const imgUrl = mainImg?.url || p.image_url || "";
                const imgCount = Array.isArray(p.images) ? p.images.length : (imgUrl ? 1 : 0);
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="adp-product-cell">
                        {imgUrl && <img src={imgUrl} alt={p.name} className="adp-thumb" />}
                        <span>{p.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="adp-img-count">
                        {imgCount > 0 ? `${imgCount} foto${imgCount !== 1 ? "s" : ""}` : "—"}
                      </span>
                    </td>
                    <td>
                      <span className="adp-cat-badge" style={{ "--cat-color": getCatColor(p.category) }}>
                        {p.category}
                      </span>
                    </td>
                    <td><strong>{p.price}</strong></td>
                    <td className="admin-table__actions">
                      <button className="admin-btn admin-btn--sm" onClick={() => openEdit(p)}>Editar</button>
                      <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => handleDelete(p.id)}>Eliminar</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

