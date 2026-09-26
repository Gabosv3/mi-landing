import { useState, useEffect, useRef } from "react";
import {
  collection, getDocs, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp, orderBy, query as fsQuery,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { uploadImage as uploadFile } from "../../utils/uploadImage";
import { parsePrice, getDiscountInfo, displayPrice } from "../../utils/price";
import RichTextEditor from "../../components/admin/RichTextEditor";
import { useConfirm } from "../../context/ConfirmContext";

/* Genera un id unico local para manejar el array de imagenes en estado */
let _uid = 0;
const uid = () => `img_${Date.now()}_${_uid++}`;

function buildImageItem(url, path, isPrimary, file) {
  return { id: uid(), url, storagePath: path, isPrimary: !!isPrimary, file: file || null, uploading: false, progress: 0 };
}

let _colorUid = 0;
const colorUid = () => `color_${Date.now()}_${_colorUid++}`;

const EMPTY_FORM = { name: "", category: "", subcategory: "", customCategory: "", description: "", price: "", compareAtPrice: "", brand: "", availability: "Disponible" };

export default function AdminProductos() {
  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [catColors,   setCatColors]   = useState({});
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [images,      setImages]      = useState([]);         // array de image items
  const [colors,      setColors]      = useState([]);         // array de {id, name, hex, imageUrl}
  const [editingId,   setEditingId]   = useState(null);
  const [showForm,    setShowForm]    = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [search,      setSearch]      = useState("");
  const fileInputRef = useRef(null);
  const confirm = useConfirm();

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
    setColors([]);
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
      compareAtPrice: p.compareAtPrice || "",
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
    setColors(
      Array.isArray(p.colors)
        ? p.colors.map((c) => ({ id: colorUid(), name: c.name || "", hex: c.hex || "#000000", imageUrl: c.imageUrl || "" }))
        : []
    );
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

  const removeImage = async (id) => {
    if (!(await confirm("Se quitará esta imagen del producto.", { title: "¿Eliminar imagen?", danger: true, confirmText: "Eliminar" }))) return;
    setImages((prev) => {
      const next = prev.filter((img) => img.id !== id);
      if (next.length > 0 && !next.some((img) => img.isPrimary)) next[0].isPrimary = true;
      return next;
    });
  };

  /* -- Colores disponibles -- */
  const addColor = () =>
    setColors((prev) => [...prev, { id: colorUid(), name: "", hex: "#000000", imageUrl: images[0]?.url || "" }]);

  const updateColor = (id, field, val) =>
    setColors((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: val } : c)));

  const removeColor = async (id) => {
    if (!(await confirm("Se quitará este color de la lista.", { title: "¿Eliminar color?", danger: true, confirmText: "Eliminar" }))) return;
    setColors((prev) => prev.filter((c) => c.id !== id));
  };

  /* -- Subir imagen a nuestro backend -- */
  const uploadImage = async (item) => {
    setImages((prev) => prev.map((i) => i.id === item.id ? { ...i, uploading: true, progress: 50 } : i));

    const url = await uploadFile(item.file);

    setImages((prev) => prev.map((i) => i.id === item.id ? { ...i, uploading: false, progress: 100, url, storagePath: "", file: null } : i));
    return { url, path: "" };
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert("El nombre del producto es obligatorio.");
    if (!form.price.trim()) return alert("El precio es obligatorio.");
    if (form.compareAtPrice.trim()) {
      const sale = parsePrice(form.price);
      const original = parsePrice(form.compareAtPrice);
      if (!Number.isFinite(original)) return alert("El precio original debe ser un número (ej: 25.00).");
      if (Number.isFinite(sale) && original <= sale) return alert("El precio original debe ser mayor que el precio con descuento.");
    }
    if (!form.category) return alert("Selecciona una categoría.");
    if (form.category === "custom" && !form.customCategory.trim()) return alert("Escribe el nombre de la categoría personalizada.");
    if (!editingId && images.length === 0) return alert("Agrega al menos una imagen del producto.");
    const confirmMsg = editingId ? `¿Guardar los cambios en "${form.name.trim()}"?` : `¿Crear el producto "${form.name.trim()}"?`;
    if (!(await confirm(confirmMsg))) return;
    setSaving(true);
    try {
      const finalCategory = form.category === "custom" ? form.customCategory.trim() : form.category;

      /* Subir solo las imagenes nuevas (que tienen file); recordar la URL vieja
         (blob local) -> nueva, para poder actualizar los colores que la usaban */
      const urlRemap = {};
      const finalImages = await Promise.all(
        images.map(async (img) => {
          if (img.file) {
            const { url, path } = await uploadImage(img);
            urlRemap[img.url] = url;
            return { url, path, isPrimary: img.isPrimary };
          }
          return { url: img.url, path: img.storagePath || "", isPrimary: img.isPrimary };
        })
      );

      const primaryImg = finalImages.find((i) => i.isPrimary) || finalImages[0];

      const finalColors = colors
        .filter((c) => c.name.trim())
        .map((c) => ({ name: c.name.trim(), hex: c.hex, imageUrl: urlRemap[c.imageUrl] || c.imageUrl }));

      const data = {
        name:        form.name.trim(),
        category:    finalCategory,
        subcategory: form.subcategory.trim(),
        description: form.description.trim(),
        price:       form.price.trim(),
        compareAtPrice: form.compareAtPrice.trim(),
        brand:       form.brand.trim(),
        availability:form.availability,
        images:      finalImages,
        colors:      finalColors,
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
    const ok = await confirm("Esta acción no se puede deshacer.", { title: "¿Eliminar este producto?", danger: true, confirmText: "Eliminar" });
    if (!ok) return;
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

            {/* Precio original (descuento) */}
            <div className="admin-form-group">
              <label>Precio original (opcional)</label>
              <input
                type="text"
                name="compareAtPrice"
                value={form.compareAtPrice}
                onChange={(e) => setForm((p) => ({ ...p, compareAtPrice: e.target.value }))}
                placeholder="Ej: 25.00 — déjalo vacío si no hay descuento"
              />
              <small>Si lo llenas, se mostrará tachado junto al precio con descuento.</small>
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
              <RichTextEditor
                key={editingId || "new"}
                value={form.description}
                onChange={(html) => setForm((p) => ({ ...p, description: html }))}
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
                    {img.isPrimary && <span className="adp-img-item__badge">⭐ Principal</span>}
                    <div className="adp-img-item__actions">
                      {!img.isPrimary && (
                        <button type="button" className="adp-img-btn adp-img-btn--star" onClick={() => setPrimary(img.id)} title="Hacer principal">
                          ⭐
                        </button>
                      )}
                      <button type="button" className="adp-img-btn adp-img-btn--del" onClick={() => removeImage(img.id)} title="Eliminar">
                        🗑️
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

          {/* ---- COLORES DISPONIBLES ---- */}
          <div className="adp-images-section">
            <div className="adp-images-header">
              <span className="adp-images-title">Colores disponibles</span>
              <span className="adp-images-hint">Cada color puede mostrar una imagen distinta</span>
            </div>

            {colors.length > 0 && (
              <div className="adp-colors-list">
                {colors.map((c) => (
                  <div className="adp-color-row" key={c.id}>
                    <input
                      type="color"
                      value={c.hex}
                      onChange={(e) => updateColor(c.id, "hex", e.target.value)}
                    />
                    <input
                      type="text"
                      value={c.name}
                      onChange={(e) => updateColor(c.id, "name", e.target.value)}
                      placeholder="Nombre del color (ej: Rosado)"
                    />
                    <select
                      value={c.imageUrl}
                      onChange={(e) => updateColor(c.id, "imageUrl", e.target.value)}
                    >
                      <option value="">-- Imagen para este color --</option>
                      {images.map((img, i) => (
                        <option key={img.id} value={img.url}>Imagen {i + 1}</option>
                      ))}
                    </select>
                    {c.imageUrl && <img src={c.imageUrl} alt="" className="adp-color-row__preview" />}
                    <button type="button" className="adp-img-btn adp-img-btn--del" onClick={() => removeColor(c.id)} title="Eliminar color">
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button type="button" className="adp-add-images-btn" onClick={addColor} disabled={images.length === 0}>
              <span>+</span> Agregar color
            </button>
            {images.length === 0 && (
              <p className="adp-images-empty">Agrega primero las imágenes del producto.</p>
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
                    <td>
                      <strong>{displayPrice(p.price)}</strong>
                      {getDiscountInfo(p.price, p.compareAtPrice) && (
                        <span className="adp-discount-badge">-{getDiscountInfo(p.price, p.compareAtPrice).percent}%</span>
                      )}
                    </td>
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

