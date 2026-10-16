import { Bricolage_Grotesque, Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import HideOnAuth from '@/components/HideOnAuth';
import './globals.css';

const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-display', weight: ['500', '600', '700', '800'] });
const body = Inter({ subsets: ['latin'], variable: '--font-body' });

export const metadata = {
  title: { default: 'SwapS.ng — Swap what you have for what you want', template: '%s · SwapS.ng' },
  description:
    'Trade your car, phone, TV, fridge, laptop or furniture for something better. Get an instant price, pay only the difference, protected by escrow.',
};

export const viewport = { themeColor: '#ffffff' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <HideOnAuth><Navbar /></HideOnAuth>
        <main>{children}</main>
        <HideOnAuth><Footer /></HideOnAuth>
        <ScrollReveal />
      </body>
    </html>
  );
}
