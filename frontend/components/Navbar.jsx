'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Logo from './Logo';
import { NAV } from '@/lib/nav';
import { api } from '@/lib/api';

export default function Navbar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    api('/auth/me').then((r) => setSignedIn(!!r.user)).catch(() => setSignedIn(false));
  }, [path]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <header className={`nav ${scrolled ? 'scrolled' : ''} ${open ? 'menu-open' : ''}`}>
      <div className="wrap nav-in">
        <Logo />
        <nav className="nav-links" aria-label="Primary">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={path === n.href ? 'active' : ''} aria-current={path === n.href ? 'page' : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="nav-right">
          <Link href={signedIn ? '/dashboard' : '/login'} className="nav-login">{signedIn ? 'Dashboard' : 'Log in'}</Link>
          <Link href="/early-access" className="btn btn-primary btn-sm">Get early access</Link>
          <button
            type="button"
            className="burger"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
      <div className="mobile-menu" hidden={!open}>
        <nav aria-label="Mobile">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={path === n.href ? 'active' : ''}>{n.label}</Link>
          ))}
          <Link href={signedIn ? '/dashboard' : '/login'} className="btn btn-ghost btn-lg btn-block">{signedIn ? 'Dashboard' : 'Log in'}</Link>
          <Link href="/early-access" className="btn btn-primary btn-lg btn-block">Get early access</Link>
        </nav>
      </div>
    </header>
  );
}
