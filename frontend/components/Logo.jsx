import Link from 'next/link';
import Icon from './Icons';

export default function Logo() {
  return (
    <Link href="/" className="logo" aria-label="SwapS.ng home">
      <span className="logo-mark"><Icon name="swap" size={18} stroke={2.4} /></span>
      <span>Swap<b>S</b>.ng</span>
    </Link>
  );
}
