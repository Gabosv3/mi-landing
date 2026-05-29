import { useState, useEffect } from "react";
import {
  collection, getDocs, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp, orderBy, query,
} from "firebase/firestore";
import { db } from "../../firebase/config";

const PALETTE = [
  "#3b82f6", "#f59e0b", "#8b5cf6", "#06b6d4",
  "#10b981", "#ef4444", "#6366f1", "#f97316",
  "#ec4899", "#14b8a6", "#84cc16", "#9ca3af",
];

const ICONS = ["🧹", "🍽️", "🛏️", "🚿", "🛋️", "⚡", "📦", "🏠", "🌿", "✨", "🔧", "📋"];

const EMPTY_FORM = { name: "", color: PALETTE[0], icon: "📦" };

export default function AdminCategorias() {
  const [categories, setCategories] = useState([]);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [editingId,  setEditingId]  = useState(null);
  const [showForm,   setShowForm]   = useState(false);
  const [saving,     setSaving]     = useState(false);

  const load = async () => {
    try {
      const snap = await getDocs(query(collection(db, "categories"), orderBy("name")));
      setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch {
      // Si no existe la coleccion, la lista queda vacia
    }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (cat) => {
    setForm({ name: cat.name, color: cat.color || PALETTE[0], icon: cat.icon || "📦" });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const data = { name: form.name.trim(), color: form.color, icon: form.icon, updatedAt: serverTimestamp() };
      if (editingId) {
        await updateDoc(doc(db, "categories", editingId), data);
      } else {
        await addDoc(collection(db, "categories"), { ...data, createdAt: serverTimestamp() });
      }
      await load();
      setShowForm(false);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Eliminar la categoría "${name}"?\nLos productos con esta categoría no se eliminarán.`)) return;
    try {
      await deleteDoc(doc(db, "categories", id));
      await load();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>Categorías</h1>
        <button className="admin-btn" onClick={openNew}>+ Nueva Categoría</button>
      </div>

      {/* ── Formulario ── */}
      {showForm && (
        <form className="admin-editor adc-form" onSubmit={handleSave}>
          <h2 className="admin-editor__title">
            {editingId ? "Editar Categoría" : "Nueva Categoría"}
          </h2>

          {/* Nombre */}
          <div className="admin-form-group">
            <label>Nombre *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
              placeholder="Ej: Limpieza del Hogar"
              autoFocus
            />
          </div>

          {/* Color */}
          <div className="admin-form-group">
            <label>Color de la categoría</label>
            <div className="adc-palette">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`adc-palette__swatch${form.color === c ? " adc-palette__swatch--active" : ""}`}
                  style={{ background: c }}
                  onClick={() => setForm((p) => ({ ...p, color: c }))}
                  aria-label={c}
                />
              ))}
            </div>
          </div>

          {/* Ícono */}
          <div className="admin-form-group">
            <label>Ícono</label>
            <div className="adc-icons">
              {ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  className={`adc-icons__btn${form.icon === ic ? " adc-icons__btn--active" : ""}`}
                  onClick={() => setForm((p) => ({ ...p, icon: ic }))}
                  aria-label={ic}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="adc-preview">
            <span className="adc-preview__label">Vista previa:</span>
            <span
              className="adp-cat-badge"
              style={{ "--cat-color": form.color }}
            >
              {form.icon} {form.name || "Categoría"}
            </span>
          </div>

          <div className="admin-editor__actions">
            <button type="submit" className="admin-btn" disabled={saving}>
              {saving ? "Guardando…" : editingId ? "Guardar cambios" : "Crear categoría"}
            </button>
            <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setShowForm(false)}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* ── Lista de categorías ── */}
      {categories.length === 0 && !showForm ? (
        <div className="admin-empty">
          <span>📦</span>
          <p>No hay categorías todavía.</p>
          <button className="admin-btn" onClick={openNew}>Crear primera categoría</button>
        </div>
      ) : (
        <div className="adc-grid">
          {categories.map((cat) => (
            <div className="adc-card" key={cat.id} style={{ "--cat-color": cat.color || "#6366f1" }}>
              <div className="adc-card__icon">{cat.icon || "📦"}</div>
              <div className="adc-card__info">
                <span className="adc-card__name">{cat.name}</span>
                <span className="adp-cat-badge" style={{ "--cat-color": cat.color || "#6366f1" }}>
                  {cat.icon} {cat.name}
                </span>
              </div>
              <div className="adc-card__actions">
                <button className="admin-btn admin-btn--sm" onClick={() => openEdit(cat)}>Editar</button>
                <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => handleDelete(cat.id, cat.name)}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
