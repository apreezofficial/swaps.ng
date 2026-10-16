'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import AuthShell from '@/components/auth/AuthShell';
import Icon from '@/components/Icons';
import { api } from '@/lib/api';

function Verify() {
  const token = useSearchParams().get('token');
  const router = useRouter();
  const started = useRef(false); // links are single-use, so never verify twice (StrictMode runs effects twice in dev)
  const [state, setState] = useState({ s: 'loading' });

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (!token) return setState({ s: 'error', msg: 'This link is missing its token.' });
    api('/auth/magic/verify', { method: 'POST', body: { token } })
      .then((r) => {
        if (r.status === 'ok') router.replace('/dashboard');
        else if (r.status === 'mfa') router.replace('/auth/2fa');
        else setState({ s: 'no_account', email: r.email });
      })
      .catch((e) => setState({ s: 'error', msg: e.message }));
  }, [token, router]);

  if (state.s === 'loading')
    return <div className="sent"><span className="sent-ico spin"><Icon name="swap" size={28} /></span><h2>Signing you in…</h2></div>;

  if (state.s === 'no_account')
    return (
      <div className="sent">
        <h2>No account yet</h2>
        <p>We could not find an account for <b>{state.email}</b>.</p>
        <Link className="btn btn-primary btn-lg" href={`/register?email=${encodeURIComponent(state.email)}`}>Create an account</Link>
      </div>
    );

  return (
    <div className="sent">
      <h2>Link not valid</h2>
      <p className="notice err">{state.msg}</p>
      <Link className="btn btn-primary btn-lg" href="/login">Request a new link</Link>
    </div>
  );
}

export default function Page() {
  return (
    <AuthShell title="Magic link" subtitle="Confirming your link.">
      <Suspense fallback={null}><Verify /></Suspense>
    </AuthShell>
  );
}
