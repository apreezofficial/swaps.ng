'use client';

import QRCode from 'qrcode';
import { useState } from 'react';
import Icon from '../Icons';
import { api } from '@/lib/api';

function Codes({ codes, onDone }) {
  const text = codes.join('\n');
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard?.writeText(text).then(() => setCopied(true));
  }
  function download() {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([`SwapS.ng recovery codes\nEach code works once.\n\n${text}\n`], { type: 'text/plain' }));
    a.download = 'swaps-recovery-codes.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  }
  return (
    <div className="rc">
      <p className="notice warn"><b>Save these recovery codes now.</b> Each works once if you lose your phone. We will not show them again.</p>
      <ul className="rc-grid">{codes.map((c) => <li key={c}>{c}</li>)}</ul>
      <div className="inline-form">
        <button type="button" className="btn btn-ghost" onClick={copy}><Icon name="copy" size={16} /> {copied ? 'Copied' : 'Copy'}</button>
        <button type="button" className="btn btn-ghost" onClick={download}>Download .txt</button>
        <button type="button" className="btn btn-primary" onClick={onDone}>I have saved them</button>
      </div>
    </div>
  );
}

export default function Authenticator({ enabled, onChange }) {
  const [step, setStep] = useState('idle'); // idle | scan | codes | disable | regen
  const [setup, setSetup] = useState(null);
  const [qr, setQr] = useState('');
  const [code, setCode] = useState('');
  const [codes, setCodes] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const reset = () => { setStep('idle'); setCode(''); setError(''); setSetup(null); setQr(''); };

  async function start() {
    setBusy(true);
    setError('');
    try {
      const s = await api('/auth/totp/setup', { method: 'POST', body: {} });
      setSetup(s);
      setQr(await QRCode.toDataURL(s.otpauth_url, { width: 220, margin: 1, color: { dark: '#063b27', light: '#ffffff' } }));
      setStep('scan');
    } catch (e) { setError(e.message); }
    setBusy(false);
  }

  async function run(path, next) {
    setBusy(true);
    setError('');
    try {
      const r = await api(path, { method: 'POST', body: { code } });
      setCode('');
      if (r.recovery_codes) { setCodes(r.recovery_codes); setStep('codes'); } else reset();
      next?.();
      onChange?.();
    } catch (e) { setError(e.message); }
    setBusy(false);
  }

  const submit = (path) => (e) => { e.preventDefault(); run(path); };
  const codeInput = (
    <input className="code-input sm" value={code} onChange={(e) => setCode(e.target.value.trim())} inputMode="numeric" autoComplete="one-time-code" placeholder="123456" autoFocus required />
  );

  return (
    <div className="sec-card">
      <header>
        <span className="sec-ico"><Icon name="shield" size={24} /></span>
        <div>
          <h3>Authenticator app (2FA) <span className={`badge ${enabled ? 'on' : ''}`}>{enabled ? 'On' : 'Off'}</span></h3>
          <p>Require a 6-digit code from Google Authenticator, Authy or 1Password when you sign in with a magic link or Google.</p>
        </div>
      </header>

      {step === 'idle' && !enabled && (
        <button type="button" className="btn btn-primary" onClick={start} disabled={busy}>Set up authenticator</button>
      )}
      {step === 'idle' && enabled && (
        <div className="inline-form">
          <button type="button" className="btn btn-ghost" onClick={() => setStep('regen')}>New recovery codes</button>
          <button type="button" className="btn btn-ghost danger" onClick={() => setStep('disable')}>Turn off</button>
        </div>
      )}

      {step === 'scan' && setup && (
        <div className="scan">
          <div className="scan-qr">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="QR code to add SwapS.ng to your authenticator app" width="220" height="220" />
          </div>
          <div>
            <ol className="scan-steps">
              <li>Open your authenticator app and scan the code.</li>
              <li>Or enter this key manually: <code className="secret">{setup.secret.match(/.{1,4}/g).join(' ')}</code></li>
              <li>Type the 6-digit code it shows.</li>
            </ol>
            <form className="inline-form" onSubmit={submit('/auth/totp/enable')}>
              {codeInput}
              <button className="btn btn-primary" disabled={busy}>Verify and turn on</button>
              <button type="button" className="btn btn-ghost" onClick={reset}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {(step === 'disable' || step === 'regen') && (
        <form className="inline-form" onSubmit={submit(step === 'disable' ? '/auth/totp/disable' : '/auth/recovery/regenerate')}>
          {codeInput}
          <button className={`btn ${step === 'disable' ? 'btn-danger' : 'btn-primary'}`} disabled={busy}>
            {step === 'disable' ? 'Confirm turn off' : 'Generate new codes'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={reset}>Cancel</button>
        </form>
      )}
      {(step === 'disable' || step === 'regen') && <p className="fine">Enter a code from your app (or a recovery code) to confirm.</p>}

      {step === 'codes' && <Codes codes={codes} onDone={reset} />}
      {error && <p className="notice err" role="alert">{error}</p>}
    </div>
  );
}
