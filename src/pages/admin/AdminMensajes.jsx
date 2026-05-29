import { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function AdminMensajes() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(collection(db, 'contacts'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch {
        // Si no existe el índice, cargar sin orden
        try {
          const snap = await getDocs(collection(db, 'contacts'));
          setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        } catch {}
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatDate = (ts) => {
    if (!ts?.toDate) return '—';
    return ts.toDate().toLocaleDateString('es-SV', { dateStyle: 'long', timeStyle: 'short' });
  };

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>Mensajes de Contacto</h1>
        <span className="admin-badge admin-badge--count">
          {loading ? '…' : messages.length} mensajes
        </span>
      </div>

      {loading ? (
        <p className="admin-loading-text">Cargando mensajes…</p>
      ) : messages.length === 0 ? (
        <p className="admin-empty">No hay mensajes aún.</p>
      ) : (
        <div className="admin-messages">
          {messages.map((m) => (
            <div className="admin-msg-card" key={m.id}>
              <div className="admin-msg-card__header">
                <div className="admin-msg-card__meta">
                  <strong>{m.name}</strong>
                  <a href={`mailto:${m.email}`}>{m.email}</a>
                  {m.phone && <span>📞 {m.phone}</span>}
                </div>
                <span className="admin-msg-card__date">{formatDate(m.createdAt)}</span>
              </div>
              <p className="admin-msg-card__body">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
