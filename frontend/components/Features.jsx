import Icon from './Icons';

const items = [
  { icon: 'bolt', t: 'Instant quotes', d: 'No back-and-forth. See the price of any swap in seconds.' },
  { icon: 'shield', t: 'Escrow on every swap', d: 'Money is held safely and only released when you confirm.' },
  { icon: 'truck', t: 'Delivery handled', d: 'Doorstep delivery priced into your total where it applies.' },
  { icon: 'chat', t: 'Bargain with vendors', d: 'Request more info or negotiate before you book.' },
  { icon: 'star', t: 'Ratings & reviews', d: 'Every vendor is scored by real customers after each swap.' },
  { icon: 'wallet', t: 'Cash out the difference', d: 'Offering more value? Get the balance paid to your bank.' },
];

export default function Features() {
  return (
    <section className="section section-tint bg-grid">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">Why SwapS</span>
          <h2>Built so trading feels safe, fast and fair.</h2>
        </div>
        <div className="feat-grid">
          {items.map((f) => (
            <div className="feat" key={f.t}>
              <span className="feat-ico"><Icon name={f.icon} size={22} /></span>
              <h3>{f.t}</h3>
              <p>{f.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
