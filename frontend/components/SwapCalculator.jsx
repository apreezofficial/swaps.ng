import Icon from './Icons';
import CalcCard from './CalcCard';

export default function SwapCalculator({ bare }) {
  return (
    <section className="section bg-mesh">
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
        </div>
        <CalcCard />
      </div>
    </section>
  );
}
