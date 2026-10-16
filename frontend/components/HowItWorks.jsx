import Link from 'next/link';
import Icon from './Icons';

const steps = [
  { icon: 'target', t: 'Select your target product', d: 'Browse cars, phones, TVs, fridges, computers and furniture from verified vendors.' },
  { icon: 'upload', t: 'Add the product you own', d: 'Upload photos and details of what you are swapping. We value it against the market.' },
  { icon: 'wallet', t: 'See what you pay or receive', d: 'Get the exact top-up to the vendor, or the amount paid straight to your bank account.' },
  { icon: 'bolt', t: 'Book your swap instantly', d: 'Confirm, pay the fees and we merge both products into one protected transaction.' },
];

export default function HowItWorks({ bare }) {
  return (
    <section className={`section ${bare ? 'bg-glow' : 'section-tint bg-grid'}`} id="how">
      <div className="wrap">
        {!bare && (
          <div className="sec-head">
            <span className="eyebrow">How it works</span>
            <h2>From &ldquo;I want that&rdquo; to done in four steps.</h2>
          </div>
        )}
        <ol className="steps">
          {steps.map((s, i) => (
            <li key={s.t} className="step">
              <span className="step-n">{i + 1}</span>
              <span className="step-ico"><Icon name={s.icon} size={24} /></span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </li>
          ))}
        </ol>
        <div className="actions">
          <div className="action"><Icon name="swap" size={22} /><div><b>Swap Now</b><span>Merge products and pay a flat ₦1,000 swap fee.</span></div></div>
          <div className="action"><Icon name="bolt" size={22} /><div><b>Buy Now</b><span>Instant purchase, delivery fee added where needed.</span></div></div>
          <div className="action"><Icon name="chat" size={22} /><div><b>Request more info</b><span>Bargain with the vendor or ask your questions first.</span></div></div>
          <div className="action"><Icon name="check" size={22} /><div><b>Check swap status</b><span>Track product details and price in real time.</span></div></div>
        </div>
        {!bare && (
          <div className="more"><Link href="/how-it-works" className="btn btn-ghost">Learn more <Icon name="arrow" size={16} stroke={2.2} /></Link></div>
        )}
      </div>
    </section>
  );
}
