import { useContent } from '../hooks/useContent';

export default function About() {
  const { content } = useContent('about');

  return (
    <section className="about" id="nosotros">
      <div className="about__inner">
        <div className="about__text">
          <div className="section-header">
            <span className="section-label">Nuestra Historia</span>
            <h2>{content.title}</h2>
          </div>
          {content.text.split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
          <div className="about__values">
            {content.values.map((v, i) => (
              <span key={i} className="about__value-tag">{v}</span>
            ))}
          </div>
        </div>

        <div className="about__visual" aria-hidden="true">
          <div className="about__box">
            <div className="about__box-content">
              <span className="about__year">{content.foundingYear || '2009'}</span>
              <p>{content.foundingLabel || 'Año de fundación'}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
