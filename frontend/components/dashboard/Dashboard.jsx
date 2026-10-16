'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import Icon from '../Icons';
import Passkeys from './Passkeys';
import Authenticator from './Authenticator';
import { api } from '@/lib/api';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  const load = useCallback(
    () =>
      api('/auth/me')
        .then((r) => {
          if (r.user) setUser(r.user);
          else router.replace(r.mfa_required ? '/auth/2fa' : '/login');
        })
        .catch(() => router.replace('/login')),
    [router]
  );
  useEffect(() => { load(); }, [load]);

  async function logout() {
    await api('/auth/logout', { method: 'POST', body: {} }).catch(() => {});
    window.location.href = '/';
  }

  if (!user) return <div className="dash"><div className="wrap"><p className="dash-loading">Loading your account…</p></div></div>;

  const first = (user.name || user.email).split(' ')[0];

  return (
    <div className="dash">
      <div className="wrap">
        <div className="dash-head">
          <div>
            <span className="eyebrow">Your account</span>
            <h1>Hi {first} 👋</h1>
            <p>{user.email}</p>
          </div>
          <button type="button" className="btn btn-ghost" onClick={logout}><Icon name="logout" size={18} /> Sign out</button>
        </div>

        <div className="dash-soon">
          <span className="dot" />
          <div>
            <b>Your swap dashboard is on the way.</b>
            <span>We are building listings, swaps and orders. Meanwhile, lock down your account below.</span>
          </div>
        </div>

        <h2 className="dash-title">Security</h2>
        <div className="sec-grid">
          <Passkeys onChange={load} />
          <Authenticator enabled={user.totp_enabled} onChange={load} />
          <div className="sec-card">
            <header>
              <span className="sec-ico"><Icon name="mail" size={24} /></span>
              <div>
                <h3>Sign-in methods</h3>
                <p>Ways you can get into this account.</p>
              </div>
            </header>
            <ul className="methods">
              <li><span>Email magic link</span><span className="badge on">Active</span></li>
              <li><span>Google</span><span className={`badge ${user.google_linked ? 'on' : ''}`}>{user.google_linked ? 'Linked' : 'Not linked'}</span></li>
              <li><span>Passkeys</span><span className={`badge ${user.passkeys ? 'on' : ''}`}>{user.passkeys ? `${user.passkeys} saved` : 'None yet'}</span></li>
            </ul>
            {!user.google_linked && <p className="fine">Sign in once with Google using this same email to link it.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
