import { useContent } from "../hooks/useContent";

export default function Stats() {
  const { content } = useContent("stats");

  return (
    <section className="stats">
      <div className="stats__label-row">
        <span>Nuestros Números</span>
      </div>
      <div className="stats__inner">
        {content.map((s, i) => (
          <div className="stat" key={i}>
            <span className="stat__number">{s.number}</span>
            <span className="stat__label">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
