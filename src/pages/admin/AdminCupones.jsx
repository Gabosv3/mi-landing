import { useState, useEffect } from "react";
import {
  collection, getDocs, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp, orderBy, query,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useConfirm } from "../../context/ConfirmContext";

const EMPTY_FORM = { code: "", type: "percent", value: "", active: true };

export default function AdminCupones() {
  const [coupons,   setCoupons]   = useState([]);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm,  setShowForm]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const confirm = useConfirm();

  const load = async () => {
    try {
      const snap = await getDocs(query(collection(db, "coupons"), orderBy("code")));
      setCoupons(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
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

  const openEdit = (c) => {
    setForm({ code: c.code, type: c.type || "percent", value: String(c.value ?? ""), active: c.active !== false });
    setEditingId(c.id);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const code = form.code.trim().toUpperCase();
    const value = parseFloat(form.value);
    if (!code) return alert("El código del cupón es obligatorio.");
    if (!Number.isFinite(value) || value <= 0) return alert("El valor del descuento debe ser un número mayor a 0.");
    if (form.type === "percent" && value > 100) return alert("Un descuento por porcentaje no puede ser mayor a 100.");

    const confirmMsg = editingId ? `¿Guardar los cambios en el cupón "${code}"?` : `¿Crear el cupón "${code}"?`;
    if (!(await confirm(confirmMsg))) return;

    setSaving(true);
    try {
      const data = { code, type: form.type, value, active: form.active, updatedAt: serverTimestamp() };
      if (editingId) {
        await updateDoc(doc(db, "coupons", editingId), data);
      } else {
        const existing = coupons.find((c) => c.code === code);
        if (existing) { alert(`Ya existe un cupón con el código "${code}".`); setSaving(false); return; }
        await addDoc(collection(db, "coupons"), { ...data, createdAt: serverTimestamp() });
      }
      await load();
      setShowForm(false);
    } catch (err) {
      alert("Error al guardar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, code) => {
    const ok = await confirm(`El cupón "${code}" ya no se podrá usar.`, { title: "¿Eliminar cupón?", danger: true, confirmText: "Eliminar" });
    if (!ok) return;
    try {
      await deleteDoc(doc(db, "coupons", id));
      await load();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const toggleActive = async (c) => {
    try {
      await updateDoc(doc(db, "coupons", c.id), { active: !c.active });
      await load();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>Cupones</h1>
        <button className="admin-btn" onClick={openNew}>+ Nuevo Cupón</button>
      </div>

      {showForm && (
        <form className="admin-editor" onSubmit={handleSave}>
          <h2 className="admin-editor__title">{editingId ? "Editar Cupón" : "Nuevo Cupón"}</h2>

          <div className="admin-form-group">
            <label>Código *</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
              placeholder="Ej: VERANO10"
              required
              autoFocus
              style={{ textTransform: "uppercase" }}
            />
            <small>El cliente escribirá este código en el carrito.</small>
          </div>

          <div className="admin-form-group">
            <label>Tipo de descuento</label>
            <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
              <option value="percent">Porcentaje (%)</option>
              <option value="fixed">Monto fijo ($)</option>
            </select>
          </div>

          <div className="admin-form-group">
            <label>Valor *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.value}
              onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))}
              placeholder={form.type === "percent" ? "Ej: 10 (para 10%)" : "Ej: 5.00"}
              required
            />
          </div>

          <div className="admin-form-group admin-form-group--inline">
            <label>
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
              />
              {" "}Activo (los clientes pueden usarlo)
            </label>
          </div>

          <div className="admin-editor__actions">
            <button type="submit" className="admin-btn" disabled={saving}>
              {saving ? "Guardando…" : editingId ? "Guardar cambios" : "Crear cupón"}
            </button>
            <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setShowForm(false)}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {coupons.length === 0 && !showForm ? (
        <div className="admin-empty">
          <span>🏷️</span>
          <p>No hay cupones todavía.</p>
          <button className="admin-btn" onClick={openNew}>Crear primer cupón</button>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Descuento</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.code}</strong></td>
                  <td>{c.type === "percent" ? `${c.value}%` : `$${Number(c.value).toFixed(2)}`}</td>
                  <td>
                    <button
                      className={`admin-badge ${c.active !== false ? "admin-badge--ok" : "admin-badge--muted"}`}
                      style={{ border: "none", cursor: "pointer" }}
                      onClick={() => toggleActive(c)}
                      title="Clic para activar/desactivar"
                    >
                      {c.active !== false ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                  <td className="admin-table__actions">
                    <button className="admin-btn admin-btn--sm" onClick={() => openEdit(c)}>Editar</button>
                    <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => handleDelete(c.id, c.code)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
