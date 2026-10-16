import PageHero from '@/components/PageHero';
import Escrow from '@/components/Escrow';
import Icon from '@/components/Icons';
import Waitlist from '@/components/Waitlist';

export const metadata = { title: 'Escrow' };

const cards = [
  { icon: 'shield', t: 'Funds held safely', d: 'Your payment never goes straight to the vendor. It stays in escrow until the swap is complete.' },
  { icon: 'check', t: 'You decide when it is done', d: 'Mark goods as received and satisfied and we release the funds. Not before.' },
  { icon: 'chat', t: 'A human steps in on issues', d: 'If something is wrong, do not confirm. We contact you directly and resolve it.' },
];

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Escrow protection" title="Your money moves only when you say so.">
        Every swap and purchase on SwapS.ng is protected from payment to delivery.
      </PageHero>
      <Escrow bare />
      <section className="section section-tint bg-grid">
        <div className="wrap feat-grid">
          {cards.map((c) => (
            <div className="feat dispute" key={c.t}>
              <span className="feat-ico"><Icon name={c.icon} size={22} /></span>
              <h3>{c.t}</h3>
              <p>{c.d}</p>
            </div>
          ))}
        </div>
      </section>
      <Waitlist />
    </>
  );
}
