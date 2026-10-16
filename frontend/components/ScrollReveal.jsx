'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const TARGETS = [
  '.sec-head', '.cat', '.step', '.action', '.feat', '.vendor', '.flow li', '.faq-item',
  '.calc-copy', '.calc-card', '.escrow', '.cta', '.stats > div', '.vendors-copy', '.faq-head',
  '.pg-hero .wrap > *', '.pcat', '.pcat-list li', '.dispute',
].join(',');

export default function ScrollReveal() {
  const path = usePathname();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    const root = document.documentElement;
    root.classList.add('reveal-on');

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      }),
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );

    const seen = new Map();
    document.querySelectorAll(TARGETS).forEach((el) => {
      const p = el.parentElement;
      const i = seen.get(p) || 0;
      seen.set(p, i + 1);
      el.setAttribute('data-reveal', '');
      el.style.setProperty('--d', `${Math.min(i, 5) * 70}ms`);
      io.observe(el);
    });

    return () => io.disconnect();
  }, [path]);

  return null;
}
