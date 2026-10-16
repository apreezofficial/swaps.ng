'use client';

import { useState } from 'react';
import Icon from './Icons';

const faqs = [
  ['How does a swap work?', 'Pick the product you want, add the one you own, and we calculate the difference. You either pay the vendor the balance or receive the balance in your bank account. Both products are then merged into one protected transaction.'],
  ['What does it cost?', 'Every swap carries a flat ₦1,000 swap fee. A delivery fee is added where delivery is needed, and you see the full total before you confirm.'],
  ['Is my money safe?', 'Yes. Payments are held in escrow. We release funds to the vendor only after you mark the goods as received and satisfied.'],
  ['What if I receive something wrong?', 'Do not confirm receipt. Reach out and our team contacts you directly to resolve it before any funds are released.'],
  ['Can I just buy instead of swapping?', 'Yes. Use Buy Now for an instant purchase, with delivery fees included where necessary.'],
  ['Can I negotiate the price?', 'Use Request More Information to bargain with the vendor or ask questions before you book.'],
];

export default function FAQ({ bare }) {
  const [open, setOpen] = useState(0);
  return (
    <section className="section bg-glow-r" id="faq">
      <div className="wrap faq">
        <div className="faq-head">
          <span className="eyebrow">{bare ? 'Support' : 'FAQ'}</span>
          <h2>{bare ? 'Still have questions?' : 'Questions, answered.'}</h2>
          <p>Still curious? Join the waitlist and we will reach out.</p>
        </div>
        <div className="faq-list">
          {faqs.map(([q, a], i) => (
            <div className={`faq-item ${open === i ? 'open' : ''}`} key={q}>
              <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
                <span>{q}</span>
                <Icon name="plus" size={20} stroke={2} />
              </button>
              <div className="faq-a"><p>{a}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
