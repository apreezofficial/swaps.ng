import Link from 'next/link';
import PageHero from '@/components/PageHero';
import Icon from '@/components/Icons';
import Waitlist from '@/components/Waitlist';
import { CATEGORIES, PRODUCTS, naira } from '@/lib/catalog';

export const metadata = { title: 'Products' };

export default function Products() {
  return (
    <>
      <PageHero eyebrow="Products" title="Everything worth swapping.">
        Six categories from verified vendors. Pick your target, offer what you own and see the price in seconds.
      </PageHero>
      <section className="section bg-glow">
        <div className="wrap pcat-grid">
          {CATEGORIES.map((c) => (
            <article className="pcat" key={c.id} id={c.id}>
              <header>
                <span className="pcat-ico"><Icon name={c.id} size={28} /></span>
                <div>
                  <h2>{c.label}</h2>
                  <p>{c.blurb}</p>
                </div>
              </header>
              <ul className="pcat-list">
                {PRODUCTS[c.id].map((p) => (
                  <li key={p.id}><span>{p.name}</span><b>{naira(p.price)}</b></li>
                ))}
              </ul>
              <footer>
                <span><Icon name="truck" size={16} /> Delivery from {naira(c.delivery)}</span>
                <Link href="/price-a-swap" className="cat-go">Swap now <Icon name="arrow" size={16} stroke={2.2} /></Link>
              </footer>
            </article>
          ))}
        </div>
      </section>
      <Waitlist />
    </>
  );
}
