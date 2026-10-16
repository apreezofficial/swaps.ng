import PageHero from '@/components/PageHero';
import FAQ from '@/components/FAQ';
import Waitlist from '@/components/Waitlist';

export const metadata = { title: 'FAQ' };

export default function Page() {
  return (
    <>
      <PageHero eyebrow="FAQ" title="Questions, answered.">
        Everything you need to know about swapping, fees and escrow.
      </PageHero>
      <FAQ bare />
      <Waitlist />
    </>
  );
}
