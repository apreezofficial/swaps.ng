'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Icon from '../Icons';
import { loginWithPasskey, passkeysSupported } from '@/lib/webauthn';

function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
      <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

export default function SocialButtons({ onError }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [canPasskey, setCanPasskey] = useState(false);

  useEffect(() => setCanPasskey(passkeysSupported()), []);

  async function passkey() {
    setBusy(true);
    onError?.('');
    try {
      await loginWithPasskey();
      router.push('/dashboard');
    } catch (e) {
      onError?.(e.message);
      setBusy(false);
    }
  }

  return (
    <div className="social">
      {/* full navigation on purpose: the PHP API redirects to Google */}
      <a className="btn btn-outline btn-lg btn-block" href="/api/auth/google/start">
        <GoogleLogo /> Continue with Google
      </a>
      {canPasskey && (
        <button type="button" className="btn btn-outline btn-lg btn-block" onClick={passkey} disabled={busy}>
          <Icon name="fingerprint" size={20} /> {busy ? 'Waiting for your device…' : 'Sign in with a passkey'}
        </button>
      )}
    </div>
  );
}
