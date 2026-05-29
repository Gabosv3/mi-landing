import { useContent } from "../hooks/useContent";

const NUMS = ["01", "02", "03", "04"];

export default function Features() {
  const { content } = useContent("features");

  return (
    <section className="features" id="servicios">
      <div className="features__inner">
        <div className="section-header">
          <span className="section-label">Por qué elegirnos</span>
          <h2>Lo que nos diferencia</h2>
        </div>
        <div className="features__grid">
          {content.map((f, i) => (
            <article className="feature-card" key={i}>
              <span className="feature-card__num">{NUMS[i] ?? `0${i+1}`}</span>
              <span className="feature-card__icon">{f.icon}</span>
              <h3 className="feature-card__title">{f.title}</h3>
              <p className="feature-card__desc">{f.desc}</p>
              <span className="feature-card__arrow">→</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
