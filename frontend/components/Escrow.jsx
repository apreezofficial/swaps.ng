import Link from 'next/link';
import Icon from './Icons';

const flow = [
  { t: 'You pay', d: 'Funds go into escrow, not to the vendor.' },
  { t: 'Products move', d: 'Both items are swapped and delivered.' },
  { t: 'You confirm', d: 'Mark the goods as received and satisfied.' },
  { t: 'Funds released', d: 'The vendor is paid. Deal done.' },
];

export default function Escrow({ bare }) {
  return (
    <section className="section" id="escrow">
      <div className="wrap">
        <div className="escrow">
          <div className="escrow-copy">
            <span className="eyebrow eyebrow-light">{bare ? 'The flow' : 'Escrow protection'}</span>
            <h2>{bare ? 'Four steps to a safe swap.' : 'Your money moves only when you say so.'}</h2>
            <p>
              When you mark your goods as received and satisfied, we release the funds. Anything wrong? We step in and
              contact you directly to make it right.
            </p>
            <Link href="/early-access" className="btn btn-white btn-lg">Swap with confidence <Icon name="arrow" size={18} stroke={2.2} /></Link>
          </div>
          <ol className="flow">
            {flow.map((f, i) => (
              <li key={f.t}>
                <span className="flow-n">{i + 1}</span>
                <div><b>{f.t}</b><span>{f.d}</span></div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
