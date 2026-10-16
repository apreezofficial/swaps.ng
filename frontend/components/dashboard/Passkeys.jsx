'use client';

import { useCallback, useEffect, useState } from 'react';
import Icon from '../Icons';
import { api } from '@/lib/api';
import { passkeysSupported, registerPasskey } from '@/lib/webauthn';

export default function Passkeys({ onChange }) {
  const [list, setList] = useState(null);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [supported, setSupported] = useState(true);

  const load = useCallback(() => api('/auth/passkeys').then((r) => setList(r.passkeys)).catch((e) => setError(e.message)), []);
  useEffect(() => { setSupported(passkeysSupported()); load(); }, [load]);

  async function add() {
    setBusy(true);
    setError('');
    try {
      await registerPasskey(name.trim() || 'My device');
      setName('');
      await load();
      onChange?.();
    } catch (e) {
      setError(e.message);
    }
    setBusy(false);
  }

  async function remove(id) {
    if (!confirm('Remove this passkey? You will no longer be able to sign in with it.')) return;
    await api(`/auth/passkeys/${id}`, { method: 'DELETE' }).catch((e) => setError(e.message));
    await load();
    onChange?.();
  }

  return (
    <div className="sec-card">
      <header>
        <span className="sec-ico"><Icon name="fingerprint" size={24} /></span>
        <div>
          <h3>Passkeys</h3>
          <p>Sign in with Face ID, Touch ID or Windows Hello. Phishing-proof and no codes to type.</p>
        </div>
      </header>

      {list?.length > 0 && (
        <ul className="pk-list">
          {list.map((p) => (
            <li key={p.id}>
              <Icon name="key" size={18} />
              <div>
                <b>{p.name}</b>
                <em>Added {new Date(p.created_at).toLocaleDateString()}{p.last_used_at ? ` · used ${new Date(p.last_used_at).toLocaleDateString()}` : ''}</em>
              </div>
              <button type="button" className="icon-btn" aria-label={`Remove ${p.name}`} onClick={() => remove(p.id)}>
                <Icon name="trash" size={18} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {supported ? (
        <div className="inline-form">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name this device (e.g. MacBook)" maxLength={60} />
          <button type="button" className="btn btn-primary" onClick={add} disabled={busy}>{busy ? 'Waiting…' : 'Add a passkey'}</button>
        </div>
      ) : (
        <p className="notice">This browser does not support passkeys.</p>
      )}
      {error && <p className="notice err" role="alert">{error}</p>}
    </div>
  );
}
