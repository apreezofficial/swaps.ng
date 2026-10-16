import Link from 'next/link';
import Icon from './Icons';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg" aria-hidden="true" />
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <span className="pill"><span className="dot" /> Nigeria&apos;s first product swap marketplace</span>
          <h1>
            Swap what you have for <span className="hl">what you want.</span>
          </h1>
          <p className="lead">
            Trade your car, phone, TV, fridge, laptop or furniture for something better. See the price instantly,
            pay only the difference, and every swap is protected by escrow.
          </p>
          <div className="hero-cta">
            <Link href="/price-a-swap" className="btn btn-primary btn-lg">Price my swap <Icon name="arrow" size={18} stroke={2.2} /></Link>
            <Link href="/how-it-works" className="btn btn-ghost btn-lg">See how it works</Link>
          </div>
          <ul className="hero-trust">
            <li><Icon name="shield" size={18} /> Escrow protected</li>
            <li><Icon name="truck" size={18} /> Doorstep delivery</li>
            <li><Icon name="star" size={16} /> Rated vendors</li>
          </ul>
        </div>

        <div className="hero-visual">
          <div className="swap-card">
            <div className="sc-head">
              <span className="sc-tag"><Icon name="bolt" size={12} /> Live quote</span>
              <span className="sc-id">#SW-20418</span>
            </div>

            <div className="sc-item">
              <span className="sc-ico"><Icon name="phones" size={26} /></span>
              <div>
                <small>You give</small>
                <strong>iPhone 13 128GB</strong>
                <em>Good condition · ₦552,500</em>
              </div>
            </div>

            <div className="sc-swap"><Icon name="swap" size={18} stroke={2.4} /></div>

            <div className="sc-item sc-item-target">
              <span className="sc-ico"><Icon name="phones" size={26} /></span>
              <div>
                <small>You get</small>
                <strong>Samsung S23 Ultra</strong>
                <em>Verified vendor · ₦1,100,000</em>
              </div>
            </div>

            <dl className="sc-sum">
              <div><dt>Price difference</dt><dd>₦547,500</dd></div>
              <div><dt>Swap fee</dt><dd>₦1,000</dd></div>
              <div><dt>Delivery</dt><dd>₦2,000</dd></div>
              <div className="sc-total"><dt>You pay</dt><dd>₦550,500</dd></div>
            </dl>

            <button className="btn btn-primary btn-block" tabIndex={-1}>Swap now</button>
          </div>

          <div className="float f1"><Icon name="shield" size={18} /> <span><b>Funds held in escrow</b><i>Released on delivery</i></span></div>
          <div className="float f2"><span className="stars"><Icon name="star" size={14} /><Icon name="star" size={14} /><Icon name="star" size={14} /><Icon name="star" size={14} /><Icon name="star" size={14} /></span><span><b>4.9 vendor rating</b><i>2,300+ reviews</i></span></div>
          <div className="float f3"><Icon name="check" size={18} stroke={2.6} /> <span><b>Swap completed</b><i>Lagos · 2 min ago</i></span></div>
        </div>
      </div>

      <div className="wrap stats">
        <div><b>₦1,000</b><span>flat swap fee</span></div>
        <div><b>6</b><span>product categories</span></div>
        <div><b>60 sec</b><span>to get a quote</span></div>
        <div><b>100%</b><span>escrow protected</span></div>
      </div>
    </section>
  );
}
