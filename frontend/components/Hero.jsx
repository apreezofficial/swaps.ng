import Link from 'next/link';
import Icon from './Icons';
import CalcCard from './CalcCard';

export default function Hero() {
  return (
    <section className="hero">
      <div className="wrap">
        <div className="hero-banner">
          <div className="hero-copy">
            <span className="kicker">Buy, sell &amp; swap in Nigeria</span>
            <span className="chip"><Icon name="swap" size={14} stroke={2.4} /> Swap instantly</span>
            <h1>
              Swap for a <span className="hl">better deal</span>
            </h1>
            <p className="lead">
              Trade your car, phone, TV, fridge, laptop or furniture. Propose what you have, calculate the value
              difference and swap with escrow-protected payments.
            </p>
            <div className="hero-cta">
              <Link href="/products" className="btn btn-primary btn-lg">Explore swaps <Icon name="arrow" size={18} stroke={2.2} /></Link>
              <Link href="/how-it-works" className="btn btn-glass btn-lg">How it works</Link>
            </div>
            <ul className="hero-trust">
              <li><Icon name="shield" size={18} /> Escrow protected</li>
              <li><Icon name="truck" size={18} /> Doorstep delivery</li>
              <li><Icon name="star" size={16} /> Rated vendors</li>
            </ul>
          </div>
          <div className="hero-calc">
            <CalcCard />
          </div>
        </div>

        <div className="stats">
          <div><b>₦1,000</b><span>flat swap fee</span></div>
          <div><b>6</b><span>product categories</span></div>
          <div><b>60 sec</b><span>to get a quote</span></div>
          <div><b>100%</b><span>escrow protected</span></div>
        </div>
      </div>
    </section>
  );
}
