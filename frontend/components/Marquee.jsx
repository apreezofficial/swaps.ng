const items = ['Cars', 'Phones', 'Televisions', 'Refrigerators', 'Computers', 'Furniture', 'Swap instantly', 'Pay only the difference', 'Escrow protected'];

export default function Marquee() {
  const row = [...items, ...items];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {row.map((t, i) => (
          <span key={i}>{t}<i /></span>
        ))}
      </div>
    </div>
  );
}
