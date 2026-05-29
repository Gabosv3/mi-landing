import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useContent } from '../hooks/useContent';

const EMPTY = { name: '', email: '', phone: '', message: '' };

export default function Contact() {
  const { content } = useContent('contact');
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState('idle'); // idle | sending | success | error

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await addDoc(collection(db, 'contacts'), {
        ...form,
        createdAt: serverTimestamp(),
      });
      setStatus('success');
      setForm(EMPTY);
    } catch {
      setStatus('error');
    }
  };

  const DETAILS = [
    { icon: '📞', label: 'Teléfono', value: content.phone, href: `tel:${content.phone}` },
    { icon: '✉️', label: 'Email', value: content.email, href: `mailto:${content.email}` },
    { icon: '📍', label: 'Dirección', value: content.address, href: null },
    { icon: '🕐', label: 'Horario', value: content.hours, href: null },
  ];

  return (
    <section className="contact" id="contacto">
      <div className="contact__inner">
        <div className="contact__info">
          <div className="section-header">
            <span className="section-label">Hablemos</span>
            <h2>Contáctanos</h2>
          </div>
          <p className="contact__intro">
            ¿Interesado en nuestros productos? Escríbenos y te responderemos a la brevedad.
          </p>
          <ul className="contact__details">
            {DETAILS.map(({ icon, label, value, href }) => (
              <li key={label} className="contact__detail">
                <span className="contact__detail-icon">{icon}</span>
                <div>
                  <strong>{label}</strong>
                  {href ? <a href={href}>{value}</a> : <span>{value}</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <form className="contact__form" onSubmit={handleSubmit} noValidate>
          {[
            { name: 'name', label: 'Nombre *', type: 'text', placeholder: 'Tu nombre completo', required: true },
            { name: 'email', label: 'Email *', type: 'email', placeholder: 'tu@email.com', required: true },
            { name: 'phone', label: 'Teléfono', type: 'tel', placeholder: '+503 0000-0000', required: false },
          ].map(({ name, label, type, placeholder, required }) => (
            <div className="form-group" key={name}>
              <label htmlFor={name}>{label}</label>
              <input
                id={name}
                type={type}
                name={name}
                value={form[name]}
                onChange={handleChange}
                placeholder={placeholder}
                required={required}
                autoComplete="off"
              />
            </div>
          ))}

          <div className="form-group">
            <label htmlFor="message">Mensaje *</label>
            <textarea
              id="message"
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="¿En qué podemos ayudarte?"
              rows={5}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn--solid btn--full"
            disabled={status === 'sending'}
          >
            {status === 'sending' ? 'Enviando…' : 'Enviar Mensaje'}
          </button>

          {status === 'success' && (
            <p className="form-feedback form-feedback--ok">
              ¡Mensaje enviado! Te contactaremos pronto.
            </p>
          )}
          {status === 'error' && (
            <p className="form-feedback form-feedback--err">
              Error al enviar. Por favor intenta de nuevo.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
