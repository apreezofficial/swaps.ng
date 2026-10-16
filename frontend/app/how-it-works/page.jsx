import PageHero from '@/components/PageHero';
import HowItWorks from '@/components/HowItWorks';
import Features from '@/components/Features';
import Waitlist from '@/components/Waitlist';

export const metadata = { title: 'How it works' };

export default function Page() {
  return (
    <>
      <PageHero eyebrow="How it works" title="Swapping, made simple.">
        Four steps from &ldquo;I want that&rdquo; to a protected, delivered swap.
      </PageHero>
      <HowItWorks bare />
      <Features />
      <Waitlist />
    </>
  );
}
