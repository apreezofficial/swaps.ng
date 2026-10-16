'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Icon from './Icons';

/**
 * Accessible custom select.
 * options: [{ value, label, hint?, icon? }]
 */
export default function Select({ value, onChange, options, label, placeholder = 'Select…', name, className = '' }) {
  const id = useId();
  const root = useRef(null);
  const list = useRef(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [up, setUp] = useState(false);

  const selIndex = options.findIndex((o) => o.value === value);
  const sel = options[selIndex];

  useEffect(() => {
    if (!open) return;
    const away = (e) => { if (!root.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', away);
    document.addEventListener('touchstart', away);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('touchstart', away);
    };
  }, [open]);

  useEffect(() => {
    if (open) list.current?.children[active]?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  function toggle() {
    if (!open) {
      setActive(Math.max(selIndex, 0));
      const r = root.current.getBoundingClientRect();
      setUp(window.innerHeight - r.bottom < 300 && r.top > 300);
    }
    setOpen((o) => !o);
  }

  function pick(i) {
    onChange(options[i].value);
    setOpen(false);
    root.current?.querySelector('button')?.focus();
  }

  function onKey(e) {
    const k = e.key;
    if (k === 'ArrowDown' || k === 'ArrowUp') {
      e.preventDefault();
      if (!open) return toggle();
      setActive((a) => (k === 'ArrowDown' ? Math.min(a + 1, options.length - 1) : Math.max(a - 1, 0)));
    } else if (k === 'Home' || k === 'End') {
      if (open) { e.preventDefault(); setActive(k === 'Home' ? 0 : options.length - 1); }
    } else if (k === 'Enter' || k === ' ') {
      e.preventDefault();
      open ? pick(active) : toggle();
    } else if (k === 'Escape' || k === 'Tab') {
      setOpen(false);
    } else if (k.length === 1 && open) {
      const i = options.findIndex((o, idx) => idx > active && o.label.toLowerCase().startsWith(k.toLowerCase()));
      const j = i >= 0 ? i : options.findIndex((o) => o.label.toLowerCase().startsWith(k.toLowerCase()));
      if (j >= 0) setActive(j);
    }
  }

  return (
    <div ref={root} className={`sel ${open ? 'open' : ''} ${up ? 'up' : ''} ${className}`}>
      {name && <input type="hidden" name={name} value={value ?? ''} />}
      <button
        type="button"
        className="sel-btn"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-label={label}
        aria-activedescendant={open ? `${id}-o${active}` : undefined}
        onClick={toggle}
        onKeyDown={onKey}
      >
        {sel?.icon && <span className="sel-ico"><Icon name={sel.icon} size={18} /></span>}
        <span className={`sel-val ${sel ? '' : 'ph'}`}>{sel ? sel.label : placeholder}</span>
        <Icon name="chev" size={18} stroke={2} className="sel-chev" />
      </button>
      <ul ref={list} id={`${id}-list`} role="listbox" aria-label={label} className="sel-list" tabIndex={-1}>
        {options.map((o, i) => (
          <li
            key={o.value}
            id={`${id}-o${i}`}
            role="option"
            aria-selected={o.value === value}
            className={`${i === active ? 'act' : ''} ${o.value === value ? 'sel-on' : ''}`}
            onMouseEnter={() => setActive(i)}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => pick(i)}
          >
            {o.icon && <span className="sel-ico"><Icon name={o.icon} size={18} /></span>}
            <span className="sel-txt">{o.label}</span>
            {o.hint && <em>{o.hint}</em>}
            {o.value === value && <Icon name="check" size={16} stroke={2.6} className="sel-tick" />}
          </li>
        ))}
      </ul>
    </div>
  );
}
