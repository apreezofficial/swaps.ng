import Link from 'next/link';
import Icon from './Icons';

const vendors = [
  { n: 'Ikeja Gadget Hub', c: 'Phones & computers', r: '4.9', rev: 812 },
  { n: 'Lekki Auto Gallery', c: 'Cars', r: '4.8', rev: 356 },
  { n: 'HomeCraft Furniture', c: 'Furniture', r: '4.9', rev: 540 },
  { n: 'CoolZone Appliances', c: 'TVs & refrigerators', r: '4.7', rev: 602 },
];

export default function Vendors() {
  return (
    <section className="section section-tint bg-grid">
      <div className="wrap vendors">
        <div className="vendors-copy">
          <span className="eyebrow">For vendors</span>
          <h2>Trusted vendors. Real reviews.</h2>
          <p>
            We partner with established vendors today and grow into our own depots. Vendors get a wave of ready buyers
            and swap-driven sales; customers get ratings they can trust.
          </p>
          <Link href="/early-access" className="btn btn-primary">Become a partner vendor <Icon name="arrow" size={18} stroke={2.2} /></Link>
        </div>
        <div className="vendor-list">
          {vendors.map((v) => (
            <div className="vendor" key={v.n}>
              <span className="vendor-ico"><Icon name="store" size={22} /></span>
              <div className="vendor-info">
                <b>{v.n}</b>
                <span>{v.c}</span>
              </div>
              <div className="vendor-rate">
                <span><Icon name="star" size={14} /> {v.r}</span>
                <i>{v.rev} reviews</i>
              </div>
            </div>
          ))}
          <p className="note">Sample vendors shown for illustration.</p>
        </div>
      </div>
    </section>
  );
}
