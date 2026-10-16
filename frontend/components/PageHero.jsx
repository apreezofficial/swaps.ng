export default function PageHero({ eyebrow, title, children }) {
  return (
    <section className="pg-hero">
      <div className="pg-hero-bg" aria-hidden="true" />
      <div className="wrap">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{children}</p>
      </div>
    </section>
  );
}
