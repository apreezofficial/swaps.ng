'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Icon from './Icons';
import Select from './Select';
import { API, CATEGORIES, CONDITIONS, PRODUCTS, computeQuote, naira } from '@/lib/catalog';

const catOptions = CATEGORIES.map((c) => ({ value: c.id, label: c.label, icon: c.id }));
const prodOptions = (cat) => PRODUCTS[cat].map((p) => ({ value: p.id, label: p.name, hint: naira(p.price) }));

export default function SwapCalculator({ bare }) {
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
    <section className="section bg-mesh" id="calculator">
      <div className="wrap calc">
        <div className="calc-copy">
          {!bare && (
            <>
              <span className="eyebrow">Price a swap</span>
              <h2>Know your number before you commit.</h2>
            </>
          )}
          <p>
            Choose what you want and what you own. We show the exact top-up you pay the vendor, or the cash that lands
            in your account. Every swap includes a flat ₦1,000 swap fee, plus delivery where needed.
          </p>
          <ul className="ticks">
            <li><Icon name="check" size={18} stroke={2.6} /> Transparent, no hidden charges</li>
            <li><Icon name="check" size={18} stroke={2.6} /> Condition-adjusted valuation</li>
            <li><Icon name="check" size={18} stroke={2.6} /> Pay the vendor or get paid to your bank</li>
          </ul>
          <span className={`api-state ${live ? 'on' : ''}`}>
            <span className="dot" /> {live ? 'Quote confirmed by SwapS API' : 'Showing estimate'}
          </span>
        </div>

        <div className="calc-card">
          <div className="field">
            <label><Icon name="target" size={16} /> I want</label>
            <div className="row2">
              <Select label="Target category" value={state.targetCategory} onChange={setTargetCategory} options={catOptions} />
              <Select label="Target product" value={state.targetId} onChange={(v) => set({ targetId: v })} options={prodOptions(state.targetCategory)} />
            </div>
            <small>Vendor price {naira(target.price)}</small>
          </div>

          <div className="calc-swap"><Icon name="swap" size={18} stroke={2.4} /></div>

          <div className="field">
            <label><Icon name="upload" size={16} /> I have</label>
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
            <small>Estimated value of {mine.name}: {naira(quote.your_value)}</small>
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

          <Link href="/early-access" className="btn btn-primary btn-block btn-lg">Book this swap <Icon name="arrow" size={18} stroke={2.2} /></Link>
        </div>
      </div>
    </section>
  );
}
