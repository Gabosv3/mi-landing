import { useState, useEffect, useRef } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../firebase/config";
import { uploadImage } from "../../../utils/uploadImage";
import { DEFAULT_CONTENT } from "../../../hooks/useContent";

const TRUST_ICONS = ["quality", "shipping", "support", "price", "home"];

/* ── helpers ──────────────────────────────────────────────── */
const isArraySection = (section) => section === "features" || section === "stats";

export function cloneDefault(section) {
  const base = DEFAULT_CONTENT[section];
  if (Array.isArray(base)) return base.map((item) => ({ ...item }));
  const copy = { ...base };
  if (Array.isArray(copy.trust)) copy.trust = copy.trust.map((item) => ({ ...item }));
  if (Array.isArray(copy.gallery)) copy.gallery = copy.gallery.map((item) => ({ ...item }));
  if (Array.isArray(copy.services)) copy.services = copy.services.map((item) => ({ ...item }));
  if (Array.isArray(copy.woods)) copy.woods = copy.woods.map((item) => ({ ...item }));
  if (Array.isArray(copy.process)) copy.process = copy.process.map((item) => ({ ...item }));
  return copy;
}

async function loadSection(section) {
  const snap = await getDoc(doc(db, "content", section));
  if (!snap.exists()) return null;
  const data = snap.data();
  return isArraySection(section) ? (data.items ?? null) : data;
}

async function saveSection(section, data) {
  const payload = isArraySection(section) ? { items: data } : data;
  await setDoc(doc(db, "content", section), payload);
}

/* ── campos reutilizables ────────────────────────────────── */
export function Field({ label, value, hint, onChange, long = false }) {
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

export function ImageField({ label, value, uploading, onUpload }) {
  const fileRef = useRef(null);
  return (
    <div className="admin-form-group">
      <label>{label}</label>
      {value && (
        <img src={value} alt={label} style={{ width: '100%', height: 180, objectFit: 'cover', marginBottom: 8, borderRadius: 6 }} />
      )}
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={(e) => onUpload(e.target.files[0])} />
      <button type="button" className="admin-btn" style={{ width: '100%' }}
        onClick={() => fileRef.current?.click()}
        disabled={uploading}>
        {uploading ? 'Guardando…' : value ? '🔄 Cambiar imagen' : '⬆ Seleccionar imagen'}
      </button>
    </div>
  );
}

export function SaveBar({ onSave, saving, saved }) {
  return (
    <div className="admin-editor__actions">
      <button className="admin-btn" onClick={onSave} disabled={saving}>
        {saving ? "Guardando…" : "Guardar cambios"}
      </button>
      {saved && <span className="admin-saved">✓ Guardado exitosamente</span>}
    </div>
  );
}

/* ── Editores de sección ─────────────────────────────────── */
export function HeroEditor({ data, onChange, onSave, saving, saved }) {
  const [uploading, setUploading] = useState(false);
  const f = (key) => (val) => onChange({ ...data, [key]: val });

  const uploadHeroImage = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange({ ...data, image: url });
    } catch (err) {
      alert('Error al guardar imagen: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const trust = data.trust || [];
  const updateTrust = (i, field, val) => {
    const next = trust.map((item, idx) => idx === i ? { ...item, [field]: val } : item);
    onChange({ ...data, trust: next });
  };

  return (
    <div>
      <div className="admin-editor">
        <p className="admin-editor__title">Sección Hero — parte principal de la página</p>
        <Field label="Etiqueta pequeña (badge)" value={data.badge} onChange={f("badge")} />
        <Field label="Título principal" value={data.title} onChange={f("title")} long hint='Usa \n para saltos de línea. Ej: "Distribuidora\nBriancesco\nMenjivar"' />
        <Field label="Subtítulo / descripción" value={data.subtitle} onChange={f("subtitle")} long />
        <Field label="Texto botón principal" value={data.cta_primary} onChange={f("cta_primary")} />
        <Field label="Texto botón secundario" value={data.cta_secondary} onChange={f("cta_secondary")} />
        <Field label="Texto de la nota sobre la imagen" value={data.noteText} onChange={f("noteText")} long hint='Usa \n para saltos de línea' />
        <ImageField label="Imagen principal del Hero" value={data.image} uploading={uploading} onUpload={uploadHeroImage} />
      </div>

      <div className="admin-editor">
        <p className="admin-editor__title">Franja de confianza (4 elementos bajo el Hero)</p>
        {trust.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 10 }}>
            <div className="admin-form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Ícono</label>
              <select value={item.icon} onChange={(e) => updateTrust(i, 'icon', e.target.value)}>
                {TRUST_ICONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
              </select>
            </div>
            <div className="admin-form-group" style={{ flex: 2, marginBottom: 0 }}>
              <label>Texto {i + 1}</label>
              <input type="text" value={item.label} onChange={(e) => updateTrust(i, 'label', e.target.value)} />
            </div>
          </div>
        ))}
      </div>

      <div className="admin-editor" style={{ background: 'transparent', boxShadow: 'none' }}>
        <SaveBar onSave={onSave} saving={saving} saved={saved} />
      </div>
    </div>
  );
}

export function FeaturesEditor({ data, onChange, onSave, saving, saved }) {
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

export function StatsEditor({ data, onChange, onSave, saving, saved }) {
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

export function AboutEditor({ data, onChange, onSave, saving, saved }) {
  const [uploading, setUploading] = useState(false);
  const f = (key) => (val) => onChange({ ...data, [key]: val });
  const handleValues = (val) => onChange({ ...data, values: val.split(",").map((s) => s.trim()).filter(Boolean) });

  const uploadAboutImage = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange({ ...data, image: url });
    } catch (err) {
      alert('Error al guardar imagen: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="admin-editor">
        <p className="admin-editor__title">Sección Nosotros</p>
        <Field label="Título de la sección" value={data.title} onChange={f("title")} />
        <Field label="Subtítulo" value={data.subtitle} onChange={f("subtitle")} long hint='Usa \n para saltos de línea' />
        <Field label="Texto principal" value={data.text} onChange={f("text")} long hint='Usa \n\n para separar párrafos' />
        <Field
          label="Valores de la empresa (separados por coma)"
          value={Array.isArray(data.values) ? data.values.join(", ") : data.values}
          onChange={handleValues}
          hint='Ej: "Confianza, Calidad, Puntualidad, Servicio"'
        />
        <Field label="Año de fundación" value={data.foundingYear || "2009"} onChange={f("foundingYear")} />
        <Field label="Texto debajo del año" value={data.foundingLabel || "Año de fundación"} onChange={f("foundingLabel")} />
      </div>

      <div className="admin-editor">
        <p className="admin-editor__title">Vista previa en la página de inicio</p>
        <Field label="Párrafo 1" value={data.previewText1} onChange={f("previewText1")} long />
        <Field label="Párrafo 2" value={data.previewText2} onChange={f("previewText2")} long />
        <Field label="Frase destacada" value={data.highlight} onChange={f("highlight")} />
        <Field label="Texto de la insignia (ej: +15 AÑOS)" value={data.badgeYears} onChange={f("badgeYears")} />
        <Field label="Texto debajo de la insignia" value={data.badgeLabel} onChange={f("badgeLabel")} />
        <ImageField label="Imagen de la sección" value={data.image} uploading={uploading} onUpload={uploadAboutImage} />
      </div>

      <div className="admin-editor" style={{ background: 'transparent', boxShadow: 'none' }}>
        <SaveBar onSave={onSave} saving={saving} saved={saved} />
      </div>
    </div>
  );
}

export function CtaEditor({ data, onChange, onSave, saving, saved }) {
  const f = (key) => (val) => onChange({ ...data, [key]: val });
  return (
    <div className="admin-editor">
      <p className="admin-editor__title">Banner de llamado a la acción (antes del pie de página)</p>
      <Field label="Título" value={data.title} onChange={f("title")} />
      <Field label="Texto" value={data.text} onChange={f("text")} long />
      <Field label="Texto botón principal" value={data.cta_primary} onChange={f("cta_primary")} />
      <Field label="Texto botón secundario" value={data.cta_secondary} onChange={f("cta_secondary")} />
      <SaveBar onSave={onSave} saving={saving} saved={saved} />
    </div>
  );
}

export function MueblesEditor({ data, onChange, onSave, saving, saved }) {
  const [uploading, setUploading] = useState({});
  const heroBgRef = useRef(null);
  const fileRefs = useRef([]);

  const f = (key) => (val) => onChange({ ...data, [key]: val });

  const uploadLocal = async (file, key, applyUrl) => {
    if (!file) return;
    setUploading((prev) => ({ ...prev, [key]: true }));
    try {
      const url = await uploadImage(file);
      applyUrl(url);
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

  const updateImageAt = (arrayKey, i, url) => {
    const next = data[arrayKey].map((item, idx) => idx === i ? { ...item, img: url } : item);
    onChange({ ...data, [arrayKey]: next });
  };

  const addGalleryItem = () =>
    onChange({ ...data, gallery: [...data.gallery, { url: '', caption: '' }] });

  const removeGalleryItem = (i) =>
    onChange({ ...data, gallery: data.gallery.filter((_, idx) => idx !== i) });

  return (
    <div>
      <div className="admin-editor">
        <p className="admin-editor__title">Imagen de fondo del Hero</p>
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

      <div className="admin-editor">
        <p className="admin-editor__title">Textos de la página</p>
        <Field label="Título" value={data.title} onChange={f('title')} />
        <Field label="Subtítulo" value={data.subtitle} onChange={f('subtitle')} long />
        <Field label="Descripción" value={data.description} onChange={f('description')} long hint='Usa \n\n para separar párrafos' />
        <Field label="Texto del botón CTA" value={data.cta_text} onChange={f('cta_text')} />
      </div>

      {data.services.map((s, i) => (
        <div className="admin-editor" key={i}>
          <p className="admin-editor__title">Servicio {i + 1}</p>
          <Field label="Ícono" value={s.icon} onChange={(v) => updateService(i, 'icon', v)} hint='Símbolo o emoji, ej: ◆ 🪑' />
          <Field label="Título" value={s.title} onChange={(v) => updateService(i, 'title', v)} />
          <Field label="Descripción" value={s.desc} onChange={(v) => updateService(i, 'desc', v)} long />
        </div>
      ))}

      <div className="admin-editor">
        <p className="admin-editor__title">Imágenes de "Trabajamos con las mejores maderas"</p>
        {(data.woods || []).map((w, i) => (
          <ImageField
            key={i}
            label={w.name}
            value={w.img}
            uploading={uploading[`wood_${i}`]}
            onUpload={(file) => uploadLocal(file, `wood_${i}`, (url) => updateImageAt('woods', i, url))}
          />
        ))}
      </div>

      <div className="admin-editor">
        <p className="admin-editor__title">Imágenes de "Del boceto a tu hogar"</p>
        {(data.process || []).map((p, i) => (
          <ImageField
            key={i}
            label={p.name}
            value={p.img}
            uploading={uploading[`process_${i}`]}
            onUpload={(file) => uploadLocal(file, `process_${i}`, (url) => updateImageAt('process', i, url))}
          />
        ))}
      </div>

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

export function ContactEditor({ data, onChange, onSave, saving, saved }) {
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

/* ── Registro de secciones disponibles ──────────────────────
   Cada página admin (Home, Nosotros, Contacto, Muebles) pasa el
   subconjunto de claves que le corresponde. */
export const SECTION_REGISTRY = {
  hero:     { label: "Hero",            icon: "▣", Editor: HeroEditor },
  features: { label: "Características", icon: "✦", Editor: FeaturesEditor },
  stats:    { label: "Estadísticas",    icon: "◉", Editor: StatsEditor },
  cta:      { label: "Llamado a acción",icon: "➜", Editor: CtaEditor },
  about:    { label: "Nosotros",        icon: "❐", Editor: AboutEditor },
  contact:  { label: "Contacto",        icon: "✉", Editor: ContactEditor },
  muebles:  { label: "Muebles",         icon: "◧", Editor: MueblesEditor },
};

/* ── Gestor genérico de secciones de contenido ─────────────
   Recibe las claves de sección (del SECTION_REGISTRY) que le
   corresponden a esta página y maneja carga/guardado en Firestore. */
export function ContentSectionManager({ pageTitle, sectionKeys }) {
  const [activeTab, setActiveTab] = useState(sectionKeys[0]);
  const [sections, setSections] = useState(() => {
    const initial = {};
    sectionKeys.forEach((key) => { initial[key] = cloneDefault(key); });
    return initial;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingTab, setLoadingTab] = useState(false);
  const [loaded, setLoaded] = useState({});

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
  }, [activeTab, loaded]);

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

  const sharedProps = { onSave: handleSave, saving, saved };
  const { Editor } = SECTION_REGISTRY[activeTab];

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>{pageTitle}</h1>
        {sectionKeys.length > 1 && (
          <span className="admin-badge admin-badge--count">{sectionKeys.length} secciones</span>
        )}
      </div>

      {sectionKeys.length > 1 && (
        <div className="admin-tabs">
          {sectionKeys.map((key) => {
            const { label, icon } = SECTION_REGISTRY[key];
            return (
              <button
                key={key}
                className={`admin-tab${activeTab === key ? " admin-tab--active" : ""}`}
                onClick={() => { setActiveTab(key); setSaved(false); }}
              >
                <span style={{ marginRight: 6 }}>{icon}</span>
                {label}
              </button>
            );
          })}
        </div>
      )}

      {loadingTab
        ? <p className="admin-loading-text">Cargando sección…</p>
        : <Editor data={sections[activeTab]} onChange={handleChange(activeTab)} {...sharedProps} />}
    </div>
  );
}
