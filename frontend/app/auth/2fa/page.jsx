'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AuthShell from '@/components/auth/AuthShell';
import Icon from '@/components/Icons';
import { api } from '@/lib/api';

export default function TwoFactor() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('/auth/me')
      .then((r) => {
        if (r.user) router.replace('/dashboard');
        else if (!r.mfa_required) router.replace('/login');
        else setReady(true);
      })
      .catch(() => router.replace('/login'));
  }, [router]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/auth/2fa/verify', { method: 'POST', body: { code } });
      router.replace('/dashboard');
    } catch (err) {
      if (err.status === 401) return router.replace('/login');
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Two-step verification"
      subtitle={recovery ? 'Enter one of your saved recovery codes.' : 'Open your authenticator app and enter the 6-digit code for SwapS.ng.'}
      footer={<Link href="/login">Back to log in</Link>}
    >
      {ready && (
        <form onSubmit={submit} className="auth-form">
          <label className="f-field">
            <span>{recovery ? 'Recovery code' : 'Authentication code'}</span>
            <input
              className="code-input"
              value={code}
              onChange={(e) => setCode(recovery ? e.target.value : e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode={recovery ? 'text' : 'numeric'}
              autoComplete="one-time-code"
              placeholder={recovery ? 'xxxxx-xxxxx' : '000000'}
              autoFocus
              required
            />
          </label>
          {error && <p className="notice err" role="alert">{error}</p>}
          <button className="btn btn-primary btn-lg btn-block" disabled={busy || !code}>
            {busy ? 'Verifying…' : 'Verify and continue'} <Icon name="arrow" size={18} stroke={2.2} />
          </button>
          <button type="button" className="link-btn center" onClick={() => { setRecovery(!recovery); setCode(''); setError(''); }}>
            {recovery ? 'Use my authenticator app' : 'Lost your device? Use a recovery code'}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
