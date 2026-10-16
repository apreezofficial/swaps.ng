import PageHero from '@/components/PageHero';
import Vendors from '@/components/Vendors';
import Waitlist from '@/components/Waitlist';

export const metadata = { title: 'Vendors' };

export default function Page() {
  return (
    <>
      <PageHero eyebrow="For vendors" title="Turn swaps into sales.">
        We partner with established vendors today. Get a wave of ready buyers and ratings customers can trust.
      </PageHero>
      <Vendors bare />
      <Waitlist />
    </>
  );
}
