import Hero from '@/components/Hero';
import Marquee from '@/components/Marquee';
import Categories from '@/components/Categories';
import HowItWorks from '@/components/HowItWorks';
import Features from '@/components/Features';
import Escrow from '@/components/Escrow';
import Vendors from '@/components/Vendors';
import FAQ from '@/components/FAQ';
import Waitlist from '@/components/Waitlist';

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <Categories />
      <HowItWorks />
      <Features />
      <Escrow />
      <Vendors />
      <FAQ />
      <Waitlist />
    </>
  );
}
