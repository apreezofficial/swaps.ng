import Icon from '../Icons';
import Logo from '../Logo';

const points = [
  ['mail', 'No passwords, ever', 'Sign in with a one-time link sent to your email.'],
  ['fingerprint', 'Passkeys', 'Use Face ID, Touch ID or Windows Hello in one tap.'],
  ['shield', 'Authenticator 2FA', 'Add Google Authenticator for an extra lock on your account.'],
];

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <section className="auth">
      <div className="auth-main">
        <div className="auth-logo"><Logo /></div>
        <div className="auth-card">
          <h1>{title}</h1>
          <p className="auth-sub">{subtitle}</p>
          {children}
        </div>
        {footer && <p className="auth-foot">{footer}</p>}
      </div>
      <aside className="auth-side" aria-hidden="true">
        <div className="auth-side-in">
          <span className="eyebrow eyebrow-light">SwapS.ng account</span>
          <h2>Swap safely. Stay in control.</h2>
          <ul>
            {points.map(([i, t, d]) => (
              <li key={t}>
                <span><Icon name={i} size={22} /></span>
                <div><b>{t}</b><em>{d}</em></div>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </section>
  );
}
