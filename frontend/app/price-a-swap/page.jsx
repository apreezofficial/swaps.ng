import PageHero from '@/components/PageHero';
import SwapCalculator from '@/components/SwapCalculator';
import Waitlist from '@/components/Waitlist';

export const metadata = { title: 'Price a swap' };

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Price a swap" title="Know your number before you commit.">
        Choose what you want and what you own. Every swap carries a flat ₦1,000 fee, plus delivery where needed.
      </PageHero>
      <SwapCalculator bare />
      <Waitlist />
    </>
  );
}
