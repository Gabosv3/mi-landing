import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminLogin() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/admin/dashboard" replace />;

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/admin/dashboard");
    } catch {
      setError("Credenciales incorrectas. Verifica tu email y contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="al-root">
      <div className="al-bg" />
      <div className="al-card">
        <div className="al-brand">
          <div className="al-brand__mark">DBM</div>
          <h2 className="al-brand__name">Distribuidora Briancesco Menjivar</h2>
          <p className="al-brand__sub">Panel Administrativo</p>
        </div>

        {error && (
          <div className="al-error">
            <span className="al-error__icon">⚠</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="al-form">
          <div className="al-field">
            <label htmlFor="email">Correo electrónico</label>
            <div className="al-field__wrap">
              <span className="al-field__icon">✉</span>
              <input
                id="email" type="email" name="email"
                value={form.email} onChange={handleChange}
                placeholder="admin@dbm.com" required autoComplete="email"
              />
            </div>
          </div>

          <div className="al-field">
            <label htmlFor="password">Contraseña</label>
            <div className="al-field__wrap">
              <span className="al-field__icon">🔒</span>
              <input
                id="password" type="password" name="password"
                value={form.password} onChange={handleChange}
                placeholder="••••••••" required autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" className="al-submit" disabled={loading}>
            {loading ? (
              <span className="al-submit__spinner" />
            ) : (
              "Iniciar Sesión"
            )}
          </button>
        </form>

        <p className="al-footer">© 2026 DBM · Acceso restringido</p>
      </div>
    </div>
  );
}
