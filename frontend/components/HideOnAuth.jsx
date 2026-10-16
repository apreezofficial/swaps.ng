'use client';

import { usePathname } from 'next/navigation';

const AUTH = ['/login', '/register', '/auth'];

/** Renders its children everywhere except on the sign-in pages. */
export default function HideOnAuth({ children }) {
  const path = usePathname();
  if (AUTH.some((p) => path === p || path.startsWith(p + '/'))) return null;
  return children;
}
