import { useState, useEffect, useRef } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { DEFAULT_CONTENT } from "../../hooks/useContent";

const TABS = [
  { key: "hero",     label: "Hero",           icon: "▣" },
  { key: "features", label: "Caracteristicas", icon: "✦" },
  { key: "stats",    label: "Estadisticas",    icon: "◉" },
  { key: "about",    label: "Nosotros",        icon: "❐" },
  { key: "contact",  label: "Contacto",        icon: "✉" },
  { key: "muebles",  label: "Muebles",         icon: "◧" },
];

/* ── helpers ──────────────────────────────────────────────── */
const isArray = (section) => section === "features" || section === "stats";

async function loadSection(section) {
  const snap = await getDoc(doc(db, "content", section));
  if (!snap.exists()) return null;
  const data = snap.data();
  return isArray(section) ? (data.items ?? null) : data;
}

async function saveSection(section, data) {
  const payload = isArray(section) ? { items: data } : data;
  await setDoc(doc(db, "content", section), payload);
}

/* ── subcomponents ───────────────────────────────────────── */
function Field({ label, value, hint, onChange, long = false }) {
  return (
    <div className="admin-form-group">
      <label>{label}</label>
      {long ? (
        <textarea rows={4} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
      {hint && <small>{hint}</small>}
    </div>
  );
}

function SaveBar({ onSave, saving, saved }) {
  return (
    <div className="admin-editor__actions">
      <button className="admin-btn" onClick={onSave} disabled={saving}>
        {saving ? "Guardando…" : "Guardar cambios"}
      </button>
      {saved && <span className="admin-saved">✓ Guardado exitosamente</span>}
    </div>
  );
}

/* ── Secciones ───────────────────────────────────────────── */
function HeroEditor({ data, onChange, onSave, saving, saved }) {
  const f = (key) => (val) => onChange({ ...data, [key]: val });
  return (
    <div className="admin-editor">
      <p className="admin-editor__title">Sección Hero — parte principal de la página</p>
      <Field label="Etiqueta pequeña (badge)" value={data.badge} onChange={f("badge")} />
      <Field label="Título principal" value={data.title} onChange={f("title")} long hint='Usa \n para saltos de línea. Ej: "Distribuidora\nBriancesco\nMenjivar"' />
      <Field label="Subtítulo / descripción" value={data.subtitle} onChange={f("subtitle")} long />
      <Field label="Texto botón principal" value={data.cta_primary} onChange={f("cta_primary")} />
      <Field label="Texto botón secundario" value={data.cta_secondary} onChange={f("cta_secondary")} />
      <SaveBar onSave={onSave} saving={saving} saved={saved} />
    </div>
  );
}

function FeaturesEditor({ data, onChange, onSave, saving, saved }) {
  const update = (i, field, val) => {
    const next = data.map((item, idx) => idx === i ? { ...item, [field]: val } : item);
    onChange(next);
  };
  return (
    <div>
      {data.map((item, i) => (
        <div className="admin-editor" key={i}>
          <p className="admin-editor__title">Característica {i + 1}</p>
          <Field label="Ícono (símbolo o emoji)" value={item.icon} onChange={(v) => update(i, "icon", v)} />
          <Field label="Título" value={item.title} onChange={(v) => update(i, "title", v)} />
          <Field label="Descripción" value={item.desc} onChange={(v) => update(i, "desc", v)} long />
        </div>
      ))}
      <div className="admin-editor" style={{ paddingTop: 0, borderTop: "none", boxShadow: "none", background: "transparent" }}>
        <SaveBar onSave={onSave} saving={saving} saved={saved} />
      </div>
    </div>
  );
}

function StatsEditor({ data, onChange, onSave, saving, saved }) {
  const update = (i, field, val) => {
    const next = data.map((item, idx) => idx === i ? { ...item, [field]: val } : item);
    onChange(next);
  };
  return (
    <div>
      <div className="adm-stats-grid">
        {data.map((item, i) => (
          <div className="admin-editor" key={i}>
            <p className="admin-editor__title">Estadística {i + 1}</p>
            <Field label="Número / valor" value={item.number} onChange={(v) => update(i, "number", v)} hint='Ej: "500+" o "1,200+"' />
            <Field label="Etiqueta" value={item.label} onChange={(v) => update(i, "label", v)} />
          </div>
        ))}
      </div>
      <div className="admin-editor" style={{ background: "transparent", boxShadow: "none" }}>
        <SaveBar onSave={onSave} saving={saving} saved={saved} />
      </div>
    </div>
  );
}

function AboutEditor({ data, onChange, onSave, saving, saved }) {
  const f = (key) => (val) => onChange({ ...data, [key]: val });
  const handleValues = (val) => onChange({ ...data, values: val.split(",").map((s) => s.trim()).filter(Boolean) });
  return (
    <div className="admin-editor">
      <p className="admin-editor__title">Sección Nosotros</p>
      <Field label="Título de la sección" value={data.title} onChange={f("title")} />
      <Field label="Texto principal" value={data.text} onChange={f("text")} long hint='Usa \n\n para separar párrafos' />
      <Field
        label="Valores de la empresa (separados por coma)"
        value={Array.isArray(data.values) ? data.values.join(", ") : data.values}
        onChange={handleValues}
        hint='Ej: "Confianza, Calidad, Puntualidad, Servicio"'
      />
      <Field label="Año de fundación" value={data.foundingYear || "2009"} onChange={f("foundingYear")} />
      <Field label="Texto debajo del año" value={data.foundingLabel || "Año de fundación"} onChange={f("foundingLabel")} />
      <SaveBar onSave={onSave} saving={saving} saved={saved} />
    </div>
  );
}

function MueblesEditor({ data, onChange, onSave, saving, saved }) {
  const [uploading, setUploading] = useState({});
  const heroBgRef = useRef(null);
  const fileRefs = useRef([]);

  const f = (key) => (val) => onChange({ ...data, [key]: val });

  /* Convierte archivo a base64 y lo envía al middleware local de Vite */
  const uploadLocal = async (file, key, applyUrl) => {
    if (!file) return;
    setUploading((prev) => ({ ...prev, [key]: true }));
    try {
      const dataUrl = await new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = (e) => res(e.target.result);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });
      const resp = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: dataUrl, name: file.name }),
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error);
      applyUrl(json.url);
    } catch (err) {
      alert('Error al guardar imagen: ' + err.message);
    } finally {
      setUploading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const updateService = (i, field, val) => {
    const next = data.services.map((s, idx) => idx === i ? { ...s, [field]: val } : s);
    onChange({ ...data, services: next });
  };

  const updateGallery = (i, field, val) => {
    const next = data.gallery.map((g, idx) => idx === i ? { ...g, [field]: val } : g);
    onChange({ ...data, gallery: next });
  };

  const addGalleryItem = () =>
    onChange({ ...data, gallery: [...data.gallery, { url: '', caption: '' }] });

  const removeGalleryItem = (i) =>
    onChange({ ...data, gallery: data.gallery.filter((_, idx) => idx !== i) });

  return (
    <div>
      {/* Imagen de fondo del Hero */}
      <div className="admin-editor">
        <p className="admin-editor__title">Imagen de fondo del Hero</p>
        <p style={{ fontSize: '0.82rem', color: '#666', marginBottom: 12 }}>
          La imagen se guarda localmente en <code>public/imagenes/uploads/</code>.
        </p>
        {data.heroBg && (
          <img src={data.heroBg} alt="Hero fondo" style={{ width: '100%', height: 180, objectFit: 'cover', marginBottom: 12, borderRadius: 6 }} />
        )}
        <input ref={heroBgRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={(e) => uploadLocal(e.target.files[0], 'heroBg', (url) => onChange({ ...data, heroBg: url }))} />
        <button className="admin-btn" style={{ width: '100%' }}
          onClick={() => heroBgRef.current?.click()}
          disabled={uploading.heroBg}>
          {uploading.heroBg ? 'Guardando…' : data.heroBg ? '🔄 Cambiar imagen de fondo' : '⬆ Seleccionar imagen de fondo'}
        </button>
      </div>

      {/* Textos principales */}
      <div className="admin-editor">
        <p className="admin-editor__title">Textos de la página</p>
        <Field label="Título" value={data.title} onChange={f('title')} />
        <Field label="Subtítulo" value={data.subtitle} onChange={f('subtitle')} long />
        <Field label="Descripción" value={data.description} onChange={f('description')} long hint='Usa \n\n para separar párrafos' />
        <Field label="Texto del botón CTA" value={data.cta_text} onChange={f('cta_text')} />
      </div>

      {/* Servicios */}
      {data.services.map((s, i) => (
        <div className="admin-editor" key={i}>
          <p className="admin-editor__title">Servicio {i + 1}</p>
          <Field label="Ícono" value={s.icon} onChange={(v) => updateService(i, 'icon', v)} hint='Símbolo o emoji, ej: ◆ 🪑' />
          <Field label="Título" value={s.title} onChange={(v) => updateService(i, 'title', v)} />
          <Field label="Descripción" value={s.desc} onChange={(v) => updateService(i, 'desc', v)} long />
        </div>
      ))}

      {/* Galería */}
      <div className="admin-editor">
        <p className="admin-editor__title">Galería de imágenes</p>
        {data.gallery.map((item, i) => (
          <div key={i} style={{ borderBottom: '1px solid var(--border-faint)', paddingBottom: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Imagen {i + 1}</span>
              <button
                className="admin-btn"
                style={{ padding: '4px 10px', fontSize: '0.75rem', background: '#fee', color: '#c00', border: '1px solid #fcc' }}
                onClick={() => removeGalleryItem(i)}
              >✕ Eliminar</button>
            </div>

            {item.url && (
              <img src={item.url} alt={item.caption} style={{ width: '100%', maxHeight: 160, objectFit: 'cover', marginBottom: 8, borderRadius: 4 }} />
            )}

            <input ref={(el) => (fileRefs.current[i] = el)} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={(e) => uploadLocal(e.target.files[0], `gallery_${i}`, (url) => updateGallery(i, 'url', url))} />
            <button className="admin-btn" style={{ marginBottom: 10, width: '100%' }}
              onClick={() => fileRefs.current[i]?.click()}
              disabled={uploading[`gallery_${i}`]}>
              {uploading[`gallery_${i}`] ? 'Guardando…' : item.url ? '🔄 Cambiar imagen' : '⬆ Seleccionar imagen'}
            </button>

            <Field label="Descripción / caption" value={item.caption} onChange={(v) => updateGallery(i, 'caption', v)} />
          </div>
        ))}
        <button className="admin-btn" style={{ width: '100%', marginTop: 4 }} onClick={addGalleryItem}>
          + Agregar imagen
        </button>
      </div>

      <div className="admin-editor" style={{ background: 'transparent', boxShadow: 'none' }}>
        <SaveBar onSave={onSave} saving={saving} saved={saved} />
      </div>
    </div>
  );
}

function ContactEditor({ data, onChange, onSave, saving, saved }) {
  const f = (key) => (val) => onChange({ ...data, [key]: val });
  return (
    <div className="admin-editor">
      <p className="admin-editor__title">Información de Contacto</p>
      <Field label="Teléfono" value={data.phone} onChange={f("phone")} hint='Ej: "+503 2222-3333"' />
      <Field label="Email" value={data.email} onChange={f("email")} />
      <Field label="Dirección" value={data.address} onChange={f("address")} />
      <Field label="Horario de atención" value={data.hours} onChange={f("hours")} hint='Ej: "Lun – Vie: 8:00 AM – 5:00 PM"' />
      <SaveBar onSave={onSave} saving={saving} saved={saved} />
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────── */
export default function AdminContenido() {
  const [activeTab, setActiveTab] = useState("hero");
  const [sections, setSections] = useState({
    hero:     { ...DEFAULT_CONTENT.hero },
    features: [...DEFAULT_CONTENT.features],
    stats:    [...DEFAULT_CONTENT.stats],
    about:    { ...DEFAULT_CONTENT.about },
    contact:  { ...DEFAULT_CONTENT.contact },
    muebles:  { ...DEFAULT_CONTENT.muebles, gallery: [...DEFAULT_CONTENT.muebles.gallery], services: [...DEFAULT_CONTENT.muebles.services] },
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingTab, setLoadingTab] = useState(false);
  const [loaded, setLoaded] = useState({});

  /* load section from Firestore the first time a tab is opened */
  useEffect(() => {
    if (loaded[activeTab]) return;
    setLoadingTab(true);
    loadSection(activeTab)
      .then((data) => {
        if (data) {
          setSections((prev) => ({ ...prev, [activeTab]: data }));
        }
        setLoaded((prev) => ({ ...prev, [activeTab]: true }));
      })
      .catch(() => setLoaded((prev) => ({ ...prev, [activeTab]: true })))
      .finally(() => setLoadingTab(false));
  }, [activeTab]);

  const handleChange = (key) => (val) =>
    setSections((prev) => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await saveSection(activeTab, sections[activeTab]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      alert("Error al guardar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const sharedProps = {
    onSave: handleSave,
    saving,
    saved,
  };

  const renderEditor = () => {
    if (loadingTab) return <p className="admin-loading-text">Cargando sección…</p>;
    switch (activeTab) {
      case "hero":     return <HeroEditor     data={sections.hero}     onChange={handleChange("hero")}     {...sharedProps} />;
      case "features": return <FeaturesEditor data={sections.features} onChange={handleChange("features")} {...sharedProps} />;
      case "stats":    return <StatsEditor    data={sections.stats}    onChange={handleChange("stats")}    {...sharedProps} />;
      case "about":    return <AboutEditor    data={sections.about}    onChange={handleChange("about")}    {...sharedProps} />;
      case "contact":  return <ContactEditor  data={sections.contact}  onChange={handleChange("contact")}  {...sharedProps} />;
      case "muebles":  return <MueblesEditor   data={sections.muebles}  onChange={handleChange("muebles")}  {...sharedProps} />;
      default: return null;
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>Contenido del Sitio</h1>
        <span className="admin-badge admin-badge--count">6 secciones</span>
      </div>

      <div className="admin-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`admin-tab${activeTab === t.key ? " admin-tab--active" : ""}`}
            onClick={() => { setActiveTab(t.key); setSaved(false); }}
          >
            <span style={{ marginRight: 6 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {renderEditor()}
    </div>
  );
}
