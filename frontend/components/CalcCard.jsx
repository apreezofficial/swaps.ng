'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Icon from './Icons';
import Select from './Select';
import { API, CATEGORIES, CONDITIONS, PRODUCTS, computeQuote, naira } from '@/lib/catalog';

const catOptions = CATEGORIES.map((c) => ({ value: c.id, label: c.label, icon: c.id }));
const prodOptions = (cat) => PRODUCTS[cat].map((p) => ({ value: p.id, label: p.name, hint: naira(p.price) }));

export default function CalcCard() {
  const [state, setState] = useState({
    targetCategory: 'phones',
    targetId: 's23u',
    yourCategory: 'phones',
    yourId: 'ip13',
    condition: 'good',
  });
  const [quote, setQuote] = useState(() => computeQuote(state));
  const [live, setLive] = useState(false);

  const set = (patch) => setState((s) => ({ ...s, ...patch }));
  const setTargetCategory = (id) => set({ targetCategory: id, targetId: PRODUCTS[id][0].id });
  const setYourCategory = (id) => set({ yourCategory: id, yourId: PRODUCTS[id][0].id });

  // Instant local quote, then confirm with the PHP API.
  const local = useMemo(() => computeQuote(state), [state]);
  useEffect(() => {
    setQuote(local);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`${API}/api/quote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(state),
          signal: ctrl.signal,
        });
        if (!r.ok) throw new Error();
        setQuote(await r.json());
        setLive(true);
      } catch (e) {
        if (e.name !== 'AbortError') setLive(false);
      }
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [state, local]);

  const target = PRODUCTS[state.targetCategory].find((p) => p.id === state.targetId);
  const mine = PRODUCTS[state.yourCategory].find((p) => p.id === state.yourId);
  const pays = quote && quote.you_pay > 0;

  return (
    <div className="calc-card">
      <div className="cc-head">
        <h3>Swap calculator</h3>
        <span className={`live ${live ? 'on' : ''}`}><i /> {live ? 'Live' : 'Estimate'}</span>
      </div>

      <div className="field">
        <label>1. Select target product</label>
        <div className="row2">
          <Select label="Target category" value={state.targetCategory} onChange={setTargetCategory} options={catOptions} />
          <Select label="Target product" value={state.targetId} onChange={(v) => set({ targetId: v })} options={prodOptions(state.targetCategory)} />
        </div>
      </div>

      <div className="field">
        <label>2. Select your product</label>
        <div className="row2">
          <Select label="Your category" value={state.yourCategory} onChange={setYourCategory} options={catOptions} />
          <Select label="Your product" value={state.yourId} onChange={(v) => set({ yourId: v })} options={prodOptions(state.yourCategory)} />
        </div>
        <div className="seg" role="radiogroup" aria-label="Condition">
          {CONDITIONS.map((c) => (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={state.condition === c.id}
              className={state.condition === c.id ? 'on' : ''}
              onClick={() => set({ condition: c.id })}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="vs">
        <div><small>Your item</small><b>{mine.name}</b><strong>{naira(quote.your_value)}</strong></div>
        <span className="vs-swap"><Icon name="swap" size={16} stroke={2.4} /></span>
        <div className="vs-target"><small>Target item</small><b>{target.name}</b><strong>{naira(target.price)}</strong></div>
      </div>

      <div className={`result ${pays ? '' : 'receive'}`}>
        <span>{pays ? 'You pay the vendor' : 'You receive in your bank'}</span>
        <strong>{naira(pays ? quote.you_pay : quote.you_receive)}</strong>
        <dl>
          <div><dt>Price difference</dt><dd>{naira(Math.abs(quote.difference))}</dd></div>
          <div><dt>Swap fee</dt><dd>{naira(quote.swap_fee)}</dd></div>
          <div><dt>Delivery</dt><dd>{naira(quote.delivery_fee)}</dd></div>
        </dl>
      </div>

      <Link href="/early-access" className="btn btn-primary btn-block btn-lg">
        <Icon name="swap" size={18} stroke={2.2} /> Propose swap
      </Link>
    </div>
  );
}
