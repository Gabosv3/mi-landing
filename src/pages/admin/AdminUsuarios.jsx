import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useConfirm } from "../../context/ConfirmContext";

const EMPTY_FORM = { name: "", email: "", password: "", role: "vendedor" };

export default function AdminUsuarios() {
  const { user } = useAuth();
  const confirm = useConfirm();
  const [users,    setUsers]    = useState([]);
  const [loaded,   setLoaded]   = useState(false);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");

  const authedFetch = async (path, options = {}) => {
    const token = await user.getIdToken();
    const res = await fetch(path, {
      ...options,
      headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Error de servidor");
    return data;
  };

  const load = async () => {
    try {
      const data = await authedFetch("/api/users");
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => { if (user) load(); }, [user]);

  const openNew = () => {
    setForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("Completa nombre, email y contraseña.");
      return;
    }
    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (!(await confirm(`¿Crear la cuenta de ${form.role === "admin" ? "administrador" : "vendedor"} para "${form.name.trim()}"?`))) return;
    setSaving(true);
    try {
      await authedFetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
        }),
      });
      await load();
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u) => {
    const ok = await confirm(`Se eliminará el acceso de "${u.name || u.email}". Esta acción no se puede deshacer.`, {
      title: "¿Eliminar usuario?", danger: true, confirmText: "Eliminar",
    });
    if (!ok) return;
    try {
      await authedFetch(`/api/users/${u.uid}`, { method: "DELETE" });
      await load();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const copyLink = async (refCode) => {
    const link = `${window.location.origin}/productos?ref=${refCode}`;
    try {
      await navigator.clipboard.writeText(link);
      alert("Link copiado: " + link);
    } catch {
      prompt("Copia el link:", link);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>Usuarios</h1>
        <button className="admin-btn" onClick={openNew}>+ Nuevo Usuario</button>
      </div>

      {showForm && (
        <form className="admin-editor" onSubmit={handleSave}>
          <h2 className="admin-editor__title">Nuevo Usuario</h2>

          {error && <p className="al-error" style={{ marginBottom: 16 }}>{error}</p>}

          <div className="admin-form-group">
            <label>Nombre *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>

          <div className="admin-form-group">
            <label>Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="juan@dbm.com"
              required
            />
          </div>

          <div className="admin-form-group">
            <label>Contraseña *</label>
            <input
              type="text"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              placeholder="Mínimo 6 caracteres"
              required
            />
            <small>Compártela con la persona; podrá cambiarla luego desde su cuenta de Google/Firebase.</small>
          </div>

          <div className="admin-form-group">
            <label>Rol</label>
            <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}>
              <option value="vendedor">Vendedor (solo ve su link y sus ventas)</option>
              <option value="admin">Administrador (acceso completo)</option>
            </select>
          </div>

          <div className="admin-editor__actions">
            <button type="submit" className="admin-btn" disabled={saving}>
              {saving ? "Creando…" : "Crear usuario"}
            </button>
            <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setShowForm(false)}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loaded && users.length === 0 && !showForm ? (
        <div className="admin-empty">
          <span>👤</span>
          <p>No hay usuarios adicionales todavía.</p>
          <button className="admin-btn" onClick={openNew}>Crear el primero</button>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Link de referido</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.uid}>
                  <td><strong>{u.name}</strong></td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`admin-badge ${u.role === "admin" ? "admin-badge--ok" : "admin-badge--muted"}`}>
                      {u.role === "admin" ? "Administrador" : "Vendedor"}
                    </span>
                  </td>
                  <td>
                    {u.refCode
                      ? <button className="admin-btn admin-btn--sm admin-btn--ghost" onClick={() => copyLink(u.refCode)}>Copiar link</button>
                      : "—"}
                  </td>
                  <td className="admin-table__actions">
                    <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => handleDelete(u)}>Eliminar</button>
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
