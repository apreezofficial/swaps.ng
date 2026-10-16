import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import HideOnAuth from '@/components/HideOnAuth';
import './globals.css';

const body = Inter({ subsets: ['latin'], variable: '--font-body', weight: ['400', '500', '600', '700', '800', '900'] });

export const metadata = {
  title: { default: 'SwapS.ng — Swap what you have for what you want', template: '%s · SwapS.ng' },
  description:
    'Trade your car, phone, TV, fridge, laptop or furniture for something better. Get an instant price, pay only the difference, protected by escrow.',
};

export const viewport = { themeColor: '#f4faf6' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={body.variable}>
      <body>
        <HideOnAuth><Navbar /></HideOnAuth>
        <main>{children}</main>
        <HideOnAuth><Footer /></HideOnAuth>
        <ScrollReveal />
      </body>
    </html>
  );
}
