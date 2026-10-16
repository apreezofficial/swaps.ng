import PageHero from '@/components/PageHero';
import Waitlist from '@/components/Waitlist';
import Icon from '@/components/Icons';

export const metadata = { title: 'Early access' };

const perks = [
  ['bolt', 'Priority access', 'Be first in when we launch in your city.'],
  ['wallet', 'Launch perks', 'Early members get swap-fee perks at launch.'],
  ['store', 'Vendors welcome', 'Tell us you are a vendor and we will reach out.'],
];

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Early access" title="Get in before everyone else.">
        We are building the SwapS.ng dashboard now. Join the list and we will invite you as soon as it is ready.
      </PageHero>
      <section className="section bg-glow" style={{ paddingBottom: 0 }}>
        <div className="wrap feat-grid">
          {perks.map(([i, t, d]) => (
            <div className="feat dispute" key={t}>
              <span className="feat-ico"><Icon name={i} size={22} /></span>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>
      <Waitlist />
    </>
  );
}
