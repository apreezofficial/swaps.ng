import Link from 'next/link';
import Icon from './Icons';
import { CATEGORIES } from '@/lib/catalog';

export default function Categories() {
  return (
    <section className="section bg-glow" id="categories">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">Products</span>
          <h2>Six categories. Endless upgrades.</h2>
          <p>Pick the product you want, offer what you own, and we handle the maths, the matching and the delivery.</p>
        </div>
        <div className="cat-grid">
          {CATEGORIES.map((c, i) => (
            <Link href={`/products#${c.id}`} className="cat" key={c.id}>
              <span className="cat-no">0{i + 1}</span>
              <span className="cat-mark" aria-hidden="true"><Icon name={c.id} size={150} stroke={1} /></span>
              <span className="cat-ico"><Icon name={c.id} size={30} /></span>
              <h3>{c.label}</h3>
              <p>{c.blurb}</p>
              <span className="cat-go">Explore <Icon name="arrow" size={16} stroke={2.2} /></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
