'use client';

import { useState } from 'react';
import Icon from './Icons';
import Select from './Select';
import { API, CATEGORIES } from '@/lib/catalog';

export default function Waitlist() {
  const [status, setStatus] = useState({ s: 'idle', msg: '' });
  const [interest, setInterest] = useState('');

  async function submit(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setStatus({ s: 'loading', msg: '' });
    try {
      const r = await fetch(`${API}/api/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: f.get('name'), email: f.get('email'), interest: f.get('interest') }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || 'Something went wrong');
      setStatus({ s: 'ok', msg: data.already ? "You're already on the list. We'll be in touch." : "You're in! We'll email you at launch." });
    } catch (err) {
      setStatus({ s: 'err', msg: err.message === 'Failed to fetch' ? 'Cannot reach the server. Please try again shortly.' : err.message });
    }
  }

  return (
    <section className="section" id="join">
      <div className="wrap">
        <div className="cta">
          <div className="cta-copy">
            <h2>Be first to swap on SwapS.ng.</h2>
            <p>Join the early-access list and get priority access when we launch in your city.</p>
          </div>
          {status.s === 'ok' ? (
            <div className="cta-done"><Icon name="check" size={28} stroke={2.6} /><p>{status.msg}</p></div>
          ) : (
            <form className="cta-form" onSubmit={submit}>
              <input name="name" placeholder="Your name" autoComplete="name" />
              <input name="email" type="email" placeholder="Email address" required autoComplete="email" />
              <Select
                name="interest"
                label="What do you want to swap?"
                placeholder="What do you want to swap?"
                value={interest}
                onChange={setInterest}
                options={[
                  ...CATEGORIES.map((c) => ({ value: c.id, label: c.label, icon: c.id })),
                  { value: 'vendor', label: "I'm a vendor", icon: 'store' },
                ]}
              />
              <button className="btn btn-white btn-lg" disabled={status.s === 'loading'}>
                {status.s === 'loading' ? 'Joining…' : 'Get early access'}
              </button>
              {status.s === 'err' && <p className="form-err" role="alert">{status.msg}</p>}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
