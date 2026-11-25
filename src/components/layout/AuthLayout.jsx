import { Link } from "react-router-dom";

export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth">
      <div className="auth-panel">
        <Link to="/" className="auth-brand">
          <span className="mark" />
          Pitching Evaluator
        </Link>
        <h1>{title}</h1>
        {subtitle && <p className="sub">{subtitle}</p>}
        {children}
        {footer}
      </div>
      <aside className="auth-aside">
        <p className="kicker">Professional judging</p>
        <h2>Run competitions with confidence.</h2>
        <p>
          Create competitions, assign evaluators, collect scores, and publish rankings — from a single
          light, focused workspace.
        </p>
      </aside>
      <style>{`
        .auth {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: var(--bg);
        }
        .auth-panel {
          padding: 48px 56px;
          background: #fff;
          display: flex;
          flex-direction: column;
          justify-content: center;
          max-width: 560px;
          width: 100%;
          margin-left: auto;
        }
        .auth-brand {
          display: flex; align-items: center; gap: 10px;
          font-weight: 700; margin-bottom: 32px; color: var(--navy);
        }
        .mark {
          width: 28px; height: 28px; border-radius: 8px;
          background: linear-gradient(135deg, var(--navy), var(--gold));
        }
        .auth-panel h1 {
          font-family: var(--serif);
          font-size: 2rem;
          margin-bottom: 8px;
        }
        .sub { color: var(--muted); margin-bottom: 24px; }
        .auth-aside {
          background: var(--navy);
          color: #fff;
          padding: 72px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .kicker {
          color: var(--gold);
          letter-spacing: 0.16em;
          text-transform: uppercase;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 16px;
        }
        .auth-aside h2 {
          font-family: var(--serif);
          font-size: 2.4rem;
          line-height: 1.2;
          margin-bottom: 16px;
        }
        .auth-aside p { color: rgba(255,255,255,0.78); max-width: 420px; }
        @media (max-width: 860px) {
          .auth { grid-template-columns: 1fr; }
          .auth-aside { display: none; }
          .auth-panel { max-width: none; padding: 32px 20px; margin: 0; }
        }
      `}</style>
    </div>
  );
}
