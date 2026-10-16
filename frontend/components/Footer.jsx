import Link from 'next/link';
import Logo from './Logo';
import { NAV } from '@/lib/nav';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap foot-in">
        <div>
          <Logo />
          <p>Swap what you have for what you want. Safe, simple and instant.</p>
        </div>
        <nav aria-label="Footer">
          {NAV.map((n) => <Link key={n.href} href={n.href}>{n.label}</Link>)}
          <Link href="/early-access">Early access</Link>
          <Link href="/login">Log in</Link>
        </nav>
      </div>
      <div className="wrap foot-base">© {new Date().getFullYear()} SwapS.ng. All rights reserved.</div>
    </footer>
  );
}
