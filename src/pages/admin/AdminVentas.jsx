import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { formatPrice } from "../../utils/price";

export default function AdminVentas() {
  const { user, profile } = useAuth();
  const [sales,  setSales]  = useState([]);
  const [loaded, setLoaded] = useState(false);
  const isVendedor = profile?.role === "vendedor";

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/sales", { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setSales(Array.isArray(data) ? data : []);
      } catch {
        setSales([]);
      } finally {
        setLoaded(true);
      }
    })();
  }, [user]);

  const referralLink = profile?.refCode ? `${window.location.origin}/productos?ref=${profile.refCode}` : null;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      alert("Link copiado: " + referralLink);
    } catch {
      prompt("Copia el link:", referralLink);
    }
  };

  const totalReferido = sales.reduce((sum, s) => sum + (Number(s.total) || 0), 0);

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>{isVendedor ? "Mis Ventas" : "Ventas"}</h1>
      </div>

      {isVendedor && (
        <div className="admin-editor" style={{ marginBottom: 24 }}>
          <p className="admin-editor__title">Tu link de referido</p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: 12 }}>
            Compártelo con tus clientes. Cuando entren con este link y te pidan la cotización por WhatsApp, la venta quedará registrada aquí como tuya.
          </p>
          {referralLink ? (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input type="text" readOnly value={referralLink} style={{ flex: 1, minWidth: 240 }} onFocus={(e) => e.target.select()} />
              <button className="admin-btn" type="button" onClick={copyLink}>Copiar link</button>
            </div>
          ) : (
            <p>Aún no tienes un código de referido asignado.</p>
          )}
        </div>
      )}

      {!isVendedor && sales.length > 0 && (
        <p className="adp-count" style={{ marginBottom: 16, display: "block" }}>
          {sales.length} venta{sales.length !== 1 ? "s" : ""} referida{sales.length !== 1 ? "s" : ""} · Total: {formatPrice(totalReferido)}
        </p>
      )}

      {loaded && sales.length === 0 ? (
        <div className="admin-empty">
          <span>💰</span>
          <p>{isVendedor ? "Todavía no tienes ventas registradas con tu link." : "Todavía no hay ventas referidas registradas."}</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Fecha</th>
                {!isVendedor && <th>Vendedor</th>}
                <th>Productos</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id}>
                  <td>{s.createdAt ? new Date(s.createdAt).toLocaleString("es-SV", { dateStyle: "medium", timeStyle: "short" }) : "—"}</td>
                  {!isVendedor && <td>{s.sellerName}</td>}
                  <td>
                    {(s.items || []).map((it, i) => (
                      <div key={i} style={{ fontSize: "0.85rem" }}>
                        {it.quantity}× {it.name}
                      </div>
                    ))}
                  </td>
                  <td>
                    <strong>{s.total != null && Number.isFinite(Number(s.total)) ? formatPrice(Number(s.total)) : "Consultar"}</strong>
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
