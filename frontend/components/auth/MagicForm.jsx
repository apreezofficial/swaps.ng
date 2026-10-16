'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Icon from '../Icons';
import SocialButtons from './SocialButtons';
import { api } from '@/lib/api';

const REASONS = {
  google_not_configured: 'Google sign-in is not set up yet. Use your email instead.',
  google_cancelled: 'Google sign-in was cancelled.',
  google_failed: 'We could not sign you in with Google. Please try again or use your email.',
};

export default function MagicForm({ mode, initialEmail = '', reason = '' }) {
  const register = mode === 'register';
  const [email, setEmail] = useState(initialEmail);
  const [name, setName] = useState('');
  const [state, setState] = useState('idle'); // idle | sending | sent
  const [error, setError] = useState(REASONS[reason] || '');
  const [devLink, setDevLink] = useState('');
  const [cool, setCool] = useState(0);

  useEffect(() => {
    if (cool <= 0) return;
    const t = setTimeout(() => setCool((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cool]);

  async function submit(e) {
    e?.preventDefault();
    setError('');
    setState('sending');
    try {
      const r = await api('/auth/magic/request', {
        method: 'POST',
        body: { email, name, purpose: register ? 'register' : 'login' },
      });
      setDevLink(r.dev_link ? new URL(r.dev_link).pathname + new URL(r.dev_link).search : '');
      setState('sent');
      setCool(30);
    } catch (err) {
      setError(err.message);
      setState('idle');
    }
  }

  if (state === 'sent') {
    return (
      <div className="sent">
        <span className="sent-ico"><Icon name="mail" size={30} /></span>
        <h2>Check your inbox</h2>
        <p>
          We sent a {register ? 'confirmation' : 'sign-in'} link to <b>{email}</b>. It works once and expires in 15 minutes.
        </p>
        {devLink && (
          <div className="dev-box">
            <b>Dev mode</b>
            <span>Emails are written to <code>backend/storage/mail.log</code>.</span>
            <Link href={devLink} className="btn btn-primary btn-sm">Open the link</Link>
          </div>
        )}
        <div className="sent-actions">
          <button type="button" className="link-btn" onClick={submit} disabled={cool > 0}>
            {cool > 0 ? `Resend in ${cool}s` : 'Resend link'}
          </button>
          <button type="button" className="link-btn" onClick={() => setState('idle')}>Use a different email</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={submit} className="auth-form" noValidate>
        {register && (
          <label className="f-field">
            <span>Full name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Ada Okafor" required />
          </label>
        )}
        <label className="f-field">
          <span>Email address</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email webauthn" placeholder="you@example.com" required />
        </label>
        {error && <p className="notice err" role="alert">{error}</p>}
        <button className="btn btn-primary btn-lg btn-block" disabled={state === 'sending'}>
          {state === 'sending' ? 'Sending…' : register ? 'Create account with email link' : 'Email me a sign-in link'}
          <Icon name="arrow" size={18} stroke={2.2} />
        </button>
        {register && <p className="fine">By continuing you agree to our terms. No password needed. We email you a secure link.</p>}
      </form>
      <div className="or"><span>or</span></div>
      <SocialButtons onError={setError} />
    </>
  );
}
